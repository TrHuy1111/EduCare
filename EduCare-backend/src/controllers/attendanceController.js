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
