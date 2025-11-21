import Class from "../models/classModel.js";
import User from "../models/User.js";
import Student from "../models/studentModel.js";

// ✅ Tạo lớp mới
export const createClass = async (req, res) => {
  try {
    const { name, level, description } = req.body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ message: "Tên lớp không hợp lệ" });
    }
    if (!level || typeof level !== "string" || !level.trim()) {
      return res.status(400).json({ message: "Cấp lớp không hợp lệ" });
    }

    const newClass = await Class.create({
      name: name.trim(),
      level: level.trim(),
      description: description?.trim() || "",
    });

    res.status(201).json({ message: "Tạo lớp học thành công", class: newClass });
  } catch (err) {
    console.error("❌ Lỗi tạo lớp:", err);
    res.status(500).json({ message: "Lỗi server khi tạo lớp", error: err.message });
  }
};

// ✅ Lấy danh sách tất cả lớp
export const getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find()
      .populate("teachers", "name email")
      .populate("students", "name")
      .populate("homeroomTeacher", "name email");
    res.status(200).json(classes);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách lớp", error: err.message });
  }
};

// ✅ Thêm giáo viên vào lớp
export const assignTeacherToClass = async (req, res) => {
  try {
    const { classId, teacherId } = req.body;
    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== "teacher")
      return res.status(400).json({ message: "Không tìm thấy giáo viên hợp lệ" });

    const updatedClass = await Class.findByIdAndUpdate(
      classId,
      { $addToSet: { teachers: teacherId } },
      { new: true }
    ).populate("teachers", "name email");

    res.status(200).json({ message: "Thêm giáo viên thành công", class: updatedClass });
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi thêm giáo viên", error: err.message });
  }
};

// ✅ Thêm học sinh vào lớp
export const enrollStudentToClass = async (req, res) => {
  try {
    const { classId, studentId } = req.body;

    const updatedClass = await Class.findByIdAndUpdate(
      classId,
      { $addToSet: { students: studentId } },
      { new: true }
    ).populate("students", "name");

    // Cập nhật học sinh liên kết với lớp
    await Student.findByIdAndUpdate(studentId, { classId });

    res.status(200).json({ message: "Thêm học sinh vào lớp thành công", class: updatedClass });
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi thêm học sinh", error: err.message });
  }
};

// ✅ Cập nhật thông tin lớp (tên, level, mô tả)
export const updateClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const updates = req.body;

    const updated = await Class.findByIdAndUpdate(classId, updates, { new: true });
    if (!updated) return res.status(404).json({ message: "Không tìm thấy lớp" });

    res.status(200).json({ message: "Cập nhật lớp thành công", class: updated });
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi cập nhật lớp", error: err.message });
  }
};
// ✅ Xóa lớp
export const deleteClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const deleted = await Class.findByIdAndDelete(classId);
    if (!deleted) return res.status(404).json({ message: "Không tìm thấy lớp" });
    res.status(200).json({ message: "Xóa lớp thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi xóa lớp", error: err.message });
  }
};
// Lấy về lớp của giáo viên đó
export const getClassesForTeacher = async (req, res) => {
  try {
    const teacherId = req.user._id;

    const classes = await Class.find({
      teachers: teacherId
    })
    .populate("teachers", "name email")
    .populate("students", "name")
    .populate("homeroomTeacher", "name email");

    res.status(200).json(classes);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi lấy lớp của giáo viên", error: err.message });
  }
};
