// controllers/tuitionController.js
import TuitionInvoice from "../models/tuitionInvoiceModel.js";
import Student from "../models/studentModel.js";
import FeeConfig from "../models/feeConfigModel.js";
import ExcelJS from "exceljs";
import Notification from "../models/notificationModel.js";
/**
 * Tạo invoice học phí cho toàn bộ học sinh theo tháng
 * Flow:
 * - Check FeeConfig
 * - Loop student
 * - Check joinedDate
 * - Gộp học phí lớp + phí khác
 */
const countBusinessDays = (startDate, endDate) => {
  let count = 0;
  const curDate = new Date(startDate);
  while (curDate <= endDate) {
    const dayOfWeek = curDate.getDay();
    if (dayOfWeek !== 0) { // 0 là Chủ Nhật (Nếu nghỉ T7 thì thêm && dayOfWeek !== 6)
      count++;
    }
    curDate.setDate(curDate.getDate() + 1);
  }
  return count;
};

export const generateMonthlyTuition = async (req, res) => {
  try {
    const { month, year } = req.body;
    if (!month || !year) return res.status(400).json({ message: "Thiếu tháng/năm" });

    // 1️⃣ Lấy FeeConfig
    const feeConfig = await FeeConfig.findOne({ month, year });
    if (!feeConfig) return res.status(400).json({ message: "Chưa cấu hình học phí tháng này" });

    // 2️⃣ Lấy danh sách học sinh đang active
    const students = await Student.find({ status: "active" });
    const created = [];
    const notifications = [];

    // Xác định ngày đầu và cuối của tháng tính phí
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0); // Ngày cuối cùng của tháng

    // Ngày công chuẩn (để chia đơn giá ngày)
    const STANDARD_DAYS = 26; 

    for (const s of students) {
      // 🛑 Kiểm tra xem học sinh có học trong tháng này không
      // Nếu ngày nhập học sau ngày cuối tháng -> Bỏ qua
      if (s.joinedDate > monthEnd) continue;
      // Nếu ngày nghỉ học trước ngày đầu tháng -> Bỏ qua
      if (s.endDate && s.endDate < monthStart) continue;

      const exists = await TuitionInvoice.findOne({ student: s._id, month, year });
      if (exists) continue;

      const levelFeeObj = feeConfig.levelFees.find(f => f.level === s.targetLevel);
      if (!levelFeeObj) {
        console.log(`⚠️ Không tìm thấy giá cho level ${s.targetLevel} của bé ${s.name}`);
        continue; // Hoặc ném lỗi tùy bạn
      }

      // 📅 TÍNH SỐ NGÀY THỰC TẾ (Overlap)
      // Bắt đầu tính = Max(Đầu tháng, Ngày nhập học)
      let calcStart = s.joinedDate > monthStart ? s.joinedDate : monthStart;
      
      // Kết thúc tính = Min(Cuối tháng, Ngày kết thúc học)
      let calcEnd = (s.endDate && s.endDate < monthEnd) ? s.endDate : monthEnd;

      // Đếm số ngày đi học thực tế trong khoảng calcStart -> calcEnd
      const actualStudyDays = countBusinessDays(calcStart, calcEnd);

      if (actualStudyDays <= 0) continue;

      // 💰 TÍNH TIỀN
      const baseFee = levelFeeObj.amount;
      const perDayFee = baseFee / STANDARD_DAYS;
      let tuitionAmount = 0;
      let note = "";

      // Logic tính toán
      if (s.isTrial) {
        // --- TRƯỜNG HỢP HỌC THỬ ---
        const discountPercent = feeConfig.trialDiscountPercent || 0;
        const rawAmount = perDayFee * actualStudyDays;
        tuitionAmount = rawAmount * (1 - discountPercent / 100);
        
        note = `Học thử ${actualStudyDays} ngày (Giảm ${discountPercent}%)`;
      } else {
        // --- TRƯỜNG HỢP CHÍNH THỨC ---
        // Nếu học đủ tháng (ngày công >= 26 hoặc không có ngày lẻ) -> Thu trọn gói
        // Nếu học thiếu tháng (nhập học giữa chừng) -> Tính theo ngày
        
        const isFullMonth = (calcStart <= monthStart) && (!s.endDate || s.endDate >= monthEnd);
        
        if (isFullMonth) {
          tuitionAmount = baseFee;
          note = `Học phí trọn gói tháng ${month}`;
        } else {
          tuitionAmount = perDayFee * actualStudyDays;
          note = `Học phí ${actualStudyDays} ngày (Nhập/nghỉ giữa tháng)`;
        }
      }

      // Làm tròn tiền (đến hàng nghìn)
      tuitionAmount = Math.ceil(tuitionAmount / 1000) * 1000;

      // 📦 TẠO ITEM HÓA ĐƠN
      const items = [];
      items.push({
        key: "tuition",
        name: note, // "Học thử 5 ngày..." hoặc "Học phí trọn gói..."
        amount: tuitionAmount,
      });

      // Cộng thêm các phí phụ thu (Ăn uống, CSVC...) nếu có
      // Lưu ý: Phí này có thể cũng cần prorated theo ngày nếu muốn, ở đây mình tạm cộng full
      feeConfig.extraFees.forEach(f => {
        items.push({
          key: f.key,
          name: f.name,
          amount: f.amount
        });
      });

      const totalAmount = items.reduce((sum, i) => sum + i.amount, 0);

      // Lưu DB
      const invoice = await TuitionInvoice.create({
        student: s._id,
        classId: s.classId || null, // Có thể null
        level: s.targetLevel,       // Lưu level
        isTrial: s.isTrial,
        studyDays: actualStudyDays,
        month,
        year,
        items,
        totalAmount,
      });

      created.push(invoice);

      if (s.parents && s.parents.length > 0) {
        for (const parentId of s.parents) {
          notifications.push({
            recipient: parentId,
            title: "📢 Thông báo học phí",
            message: `Đã có học phí tháng ${month}/${year} cho bé ${s.name}. Số tiền: ${totalAmount.toLocaleString()} VND.`,
            type: "tuition",
            relatedId: invoice._id, // Lưu ID hóa đơn để sau này click vào nhảy sang màn hình đóng tiền
            isRead: false,
          });
        }
      }
    }

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.status(201).json({
      message: "Tạo học phí thành công",
      createdCount: created.length,
      invoices: created
    });

  } catch (err) {
    console.error("Generate Tuition Error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getInvoicesByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const invoices = await TuitionInvoice.find({ student: studentId })
      .sort({ year: -1, month: -1 })
      .populate("classId", "name level"); // Nếu null thì field này null

    res.status(200).json(invoices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getInvoicesByMonth = async (req, res) => {
  try {
    // 👇 1. Nhận thêm classId từ query
    const { month, year, search, classId } = req.query; 

    // 👇 2. Tạo object query động
    const query = { month, year };
    
    // Nếu có classId (không rỗng) thì thêm vào điều kiện tìm kiếm
    if (classId) {
      query.classId = classId;
    }

    // 3. Truy vấn với filter classId
    let invoices = await TuitionInvoice.find(query)
      .populate("student", "name code")
      .populate("classId", "name level");

    // 4. Lọc tiếp bằng Search text (giữ nguyên logic cũ của bạn)
    if (search) {
      const lowerSearch = search.toLowerCase();
      invoices = invoices.filter((inv) => {
        const studentName = inv.student?.name?.toLowerCase() || "";
        const className = inv.classId?.name?.toLowerCase() || "";
        return studentName.includes(lowerSearch) || className.includes(lowerSearch);
      });
    }

    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const payInvoice = async (req, res) => {
  try {
    const { invoiceId } = req.params;

    const invoice = await TuitionInvoice.findByIdAndUpdate(
      invoiceId,
      {
        status: "paid",
        paidDate: new Date(),
      },
      { new: true }
    );

    res.status(200).json({
      message: "Thanh toán thành công",
      invoice,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getInvoiceDetail = async (req, res) => {
  try {
    const { invoiceId } = req.params;

    const invoice = await TuitionInvoice.findById(invoiceId)
      .populate("student", "name")
      .populate("classId", "name level");

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    res.json(invoice);
  } catch (err) {
    console.error("❌ get invoice detail error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const exportTuitionExcel = async (req, res) => {
  try {
    // 👇 1. Nhận thêm classId
    const { month, year, classId } = req.query;

    // 👇 2. Tạo query lọc
    const query = { month, year };
    if (classId) {
      query.classId = classId;
    }

    // 3. Tìm kiếm với query đã lọc
    const invoices = await TuitionInvoice.find(query)
      .populate("student", "name")
      .populate("classId", "name"); 

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`HocPhi_T${month}_${year}`);

    worksheet.columns = [
      { header: 'STT', key: 'stt', width: 5 },
      { header: 'Học sinh', key: 'student', width: 25 },
      { header: 'Lớp', key: 'class', width: 15 },
      { header: 'Số tiền', key: 'amount', width: 15 },
      { header: 'Trạng thái', key: 'status', width: 15 },
      { header: 'Ngày đóng', key: 'paidDate', width: 15 },
    ];

    invoices.forEach((inv, index) => {
      worksheet.addRow({
        stt: index + 1,
        student: inv.student?.name || "Unknown",
        class: inv.classId?.name || "Unknown",
        amount: inv.totalAmount,
        status: inv.status === 'paid' ? 'Đã đóng' : 'Chưa đóng',
        paidDate: inv.paidDate ? new Date(inv.paidDate).toLocaleDateString('vi-VN') : ''
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const base64 = buffer.toString('base64');

    res.json({ 
      fileName: `Baocao_Hocphi_T${month}_${year}.xlsx`,
      base64: base64 
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi xuất file" });
  }
};

export const getTuitionStats = async (req, res) => {
  try {
    const { year } = req.query;
    
    if (!year) return res.status(400).json({ message: "Thiếu năm" });

    // Aggregate: Gom nhóm theo tháng
    const stats = await TuitionInvoice.aggregate([
      { 
        $match: { year: parseInt(year) } // Lọc theo năm
      },
      {
        $group: {
          _id: "$month", // Gom theo tháng
          totalPaid: {
            $sum: { $cond: [{ $eq: ["$status", "paid"] }, "$totalAmount", 0] }
          },
          totalPending: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, "$totalAmount", 0] }
          },
          totalExpected: { $sum: "$totalAmount" }
        }
      },
      { $sort: { _id: 1 } } // Sắp xếp từ tháng 1 -> 12
    ]);

    // Format lại dữ liệu trả về mảng đủ 12 tháng (để vẽ biểu đồ không bị lệch)
    const formattedStats = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const data = stats.find(s => s._id === month);
      return {
        month: `T${month}`,
        paid: data ? data.totalPaid : 0,
        pending: data ? data.totalPending : 0,
        total: data ? data.totalExpected : 0
      };
    });

    res.json(formattedStats);
  } catch (err) {
    console.error("Stats Error:", err);
    res.status(500).json({ error: err.message });
  }
};