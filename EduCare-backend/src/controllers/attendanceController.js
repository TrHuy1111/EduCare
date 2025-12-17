///controllers/attendanceController.js
import Class from "../models/classModel.js";
import Attendance from "../models/attendanceModel.js";
import User from "../models/User.js";

export const getTeacherClasses = async (req, res) => {
  try {
    const teacherId = req.user._id;

    const classes = await Class.find({ teachers: teacherId })
      .select("name level students");

    return res.status(200).json(classes);
  } catch (err) {
    console.error("❌ getTeacherClasses error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getStudentsByClass = async (req, res) => {
  try {
    const { classId } = req.params;

    const classData = await Class.findById(classId).populate("students");

    if (!classData) return res.status(404).json({ message: "Class not found" });

    return res.status(200).json(classData.students);
  } catch (err) {
    console.error("❌ getStudentsByClass error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const saveAttendance = async (req, res) => {
  try {
    const { classId, date, records } = req.body;
    const teacherId = req.user._id;

    let attendance = await Attendance.findOne({ classId, date });

    if (!attendance) {
      attendance = await Attendance.create({
        classId,
        date,
        takenBy: teacherId,
        records
      });
    } else {
      attendance.records = records; // overwrite full session
      attendance.takenBy = teacherId;
      await attendance.save();
    }

    return res.status(200).json({ message: "Attendance saved", attendance });
  } catch (err) {
    console.error("❌ saveAttendance error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
// Lấy bảng điểm danh cho lớp vào ngày cụ thể
export const getAttendance = async (req, res) => {
  try {
    const { classId, date } = req.query;

    const attendance = await Attendance.findOne({ classId, date }).populate("records.student");

    return res.status(200).json(attendance || null);
  } catch (err) {
    console.error("❌ getAttendance error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
// 📌 Lịch sử điểm danh theo ngày (group by date)
export const getAttendanceHistory = async (req, res) => {
  try {
    const { classId } = req.query;

    if (!classId) {
      return res.status(400).json({ message: "classId is required" });
    }

    const records = await Attendance.find({ classId })
      .sort({ date: -1 }); // newest first

    // format history
    const history = records.map((att) => {
      const morning = { present: 0, absent: 0 };
      const afternoon = { present: 0, absent: 0 };

      att.records.forEach((r) => {
        if (r.session === "morning") {
          r.status === "present" ? morning.present++ : morning.absent++;
        }
        if (r.session === "afternoon") {
          r.status === "present" ? afternoon.present++ : afternoon.absent++;
        }
      });

      return {
        date: att.date,
        morning,
        afternoon,
      };
    });

    return res.status(200).json(history);
  } catch (err) {
    console.error("❌ getAttendanceHistory error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
// 📌 Thống kê điểm danh theo tháng (cho biểu đồ)
export const getAttendanceStats = async (req, res) => {
  try {
    const { classId, month, year } = req.query;

    if (!classId || !month || !year) {
      return res.status(400).json({ message: "classId, month, year are required" });
    }

    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const endDate = `${year}-${String(month).padStart(2, "0")}-31`;

    const attendances = await Attendance.find({
      classId,
      date: { $gte: startDate, $lte: endDate }
    });

    let totalSessions = 0;
    let present = 0;
    let absent = 0;

    // dailyAbsent array for chart
    const dailyMap = {};

    attendances.forEach((att) => {
      const day = att.date;

      if (!dailyMap[day]) {
        dailyMap[day] = 0;
      }

      att.records.forEach((r) => {
        totalSessions++;
        if (r.status === "present") present++;
        if (r.status === "absent") {
          absent++;
          dailyMap[day]++; // count absent per day
        }
      });
    });

    const dailyAbsent = Object.entries(dailyMap).map(([date, count]) => ({
      date,
      absent: count
    }));

    return res.status(200).json({
      totalSessions,
      present,
      absent,
      presentRate: present / totalSessions,
      absentRate: absent / totalSessions,
      dailyAbsent
    });
  } catch (err) {
    console.error("❌ getAttendanceStats error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
