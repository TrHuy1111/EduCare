// controllers/tuitionController.js
import TuitionInvoice from "../models/tuitionInvoiceModel.js";
import Student from "../models/studentModel.js";
import FeeConfig from "../models/feeConfigModel.js";

/**
 * Tạo invoice học phí cho toàn bộ học sinh theo tháng
 * Flow:
 * - Check FeeConfig
 * - Loop student
 * - Check joinedDate
 * - Gộp học phí lớp + phí khác
 */
export const generateMonthlyTuition = async (req, res) => {
  try {
    const { month, year } = req.body;

    if (!month || !year) {
      return res.status(400).json({ message: "Month và Year là bắt buộc" });
    }

    // 1️⃣ Lấy cấu hình phí
    const feeConfig = await FeeConfig.findOne({ month, year });
    if (!feeConfig) {
      return res.status(400).json({ message: "Chưa cấu hình phí cho tháng này" });
    }

    // 2️⃣ Lấy học sinh
    const students = await Student.find().populate("classId");

    const created = [];

    for (const s of students) {
      if (!s.classId) continue;

      const invoiceMonthStart = new Date(year, month - 1, 1);
      const invoiceMonthEnd = new Date(year, month, 0, 23, 59, 59);

      // nhập học sau tháng này
      if (s.joinedDate && s.joinedDate > invoiceMonthEnd) {
        continue;
      }

      // đã nghỉ học trước tháng này
      if (s.endDate && s.endDate < invoiceMonthStart) {
        continue;
      }

      // tránh tạo trùng
      const exists = await TuitionInvoice.findOne({
        student: s._id,
        month,
        year,
      });
      if (exists) continue;

      // tìm học phí theo level
      const levelFee = feeConfig.levelFees.find(
        (f) => f.level === s.classId.level
      );

      if (!levelFee) {
        console.log("❌ Missing level fee:", s.classId.level);
        continue;
      }

      // build items
      const items = [];

      items.push({
        key: "tuition",
        name: `Học phí lớp ${s.classId.level}`,
        amount: levelFee.amount,
      });

      feeConfig.extraFees.forEach((fee) => {
        items.push({
          key: fee.key,
          name: fee.name,
          amount: fee.amount,
        });
      });

      // tính tổng tiền
      const totalAmount = items.reduce(
        (sum, i) => sum + Number(i.amount || 0),
        0
      );

      if (isNaN(totalAmount)) {
        console.log("❌ totalAmount NaN", items);
        continue;
      }

      // tạo invoice
      const invoice = await TuitionInvoice.create({
        student: s._id,
        classId: s.classId._id,
        month,
        year,
        items,
        totalAmount,
      });

      created.push(invoice);
    }

    res.status(201).json({
      message: "Tạo học phí thành công",
      createdCount: created.length,
      invoices: created,
    });
  } catch (err) {
    console.error("❌ generate tuition error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getInvoicesByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    const invoices = await TuitionInvoice.find({ student: studentId })
      .sort({ year: -1, month: -1 })
      .populate("classId", "name level");

    res.status(200).json(invoices);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getInvoicesByMonth = async (req, res) => {
  const { month, year } = req.query;

  const invoices = await TuitionInvoice.find({ month, year })
    .populate("student", "name")
    .populate("classId", "name level");

  res.json(invoices);
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
