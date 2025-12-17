// controllers/classController.js
import Class from "../models/classModel.js";
import User from "../models/User.js";
import Student from "../models/studentModel.js";


const CLASS_RULES = {
  infant:   { minStudents: 1,  maxStudents: 10, minTeachers: 2 },
  toddler:  { minStudents: 1, maxStudents: 15, minTeachers: 2 },
  preK2:    { minStudents: 1, maxStudents: 18, minTeachers: 2 },
  preK3:    { minStudents: 1, maxStudents: 22, minTeachers: 2 },
  preK4:    { minStudents: 1, maxStudents: 25, minTeachers: 2 },
  preK5:    { minStudents: 1, maxStudents: 30, minTeachers: 2 },
};
// ✅ Tạo lớp mới
export const createClass = async (req, res) => {
  try {
    const { name, level, description } = req.body;

    if (!name?.trim()) 
      return res.status(400).json({ message: "Tên lớp không hợp lệ" });

    if (!level || !CLASS_RULES[level])
      return res.status(400).json({ message: "Cấp lớp không hợp lệ" });

    const rules = CLASS_RULES[level];

    const newClass = await Class.create({
      name: name.trim(),
      level,
      description: description?.trim() || "",

      // RULE tự động
      minStudents: rules.minStudents,
      maxStudents: rules.maxStudents,
      minTeachers: rules.minTeachers,
    });

    res.status(201).json({ message: "Tạo lớp học thành công", class: newClass });
  } catch (err) {
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

    const cls = await Class.findById(classId);
    if (!cls) return res.status(404).json({ message: "Lớp không tồn tại" });

    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== "teacher")
      return res.status(400).json({ message: "Không tìm thấy giáo viên hợp lệ" });

    if (cls.teachers.includes(teacherId))
      return res.status(400).json({ message: "Giáo viên đã có trong lớp" });

    const updated = await Class.findByIdAndUpdate(
      classId,
      { $addToSet: { teachers: teacherId } },
      { new: true }
    );

    res.status(200).json({
      message: "Thêm giáo viên thành công",
      class: updated,
      note: `Lớp cần tối thiểu ${cls.minTeachers} giáo viên.`,
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi thêm giáo viên", error: err.message });
  }
};


// ✅ Thêm học sinh vào lớp
export const enrollStudentToClass = async (req, res) => {
  try {
    const { classId, studentId } = req.body;

    const cls = await Class.findById(classId).populate("students");
    if (!cls) return res.status(404).json({ message: "Lớp không tồn tại" });

    // ⚠️ Không cho vượt sĩ số
    if (cls.students.length >= cls.maxStudents) {
      return res.status(400).json({
        message: `Lớp đã đạt tối đa ${cls.maxStudents} học sinh.`,
      });
    }

    // Thêm học sinh vào lớp
    const updatedClass = await Class.findByIdAndUpdate(
      classId,
      { $addToSet: { students: studentId } },
      { new: true }
    ).populate("students", "name");

    await Student.findByIdAndUpdate(studentId, { classId });

    res.status(200).json({
      message: "Thêm học sinh vào lớp thành công",
      class: updatedClass,
      note: `Sĩ số hiện tại: ${updatedClass.students.length}/${cls.maxStudents}`,
    });
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
// Xóa giáo viên khỏi lớp
export const removeTeacherFromClass = async (req, res) => {
  try {
    const { classId, teacherId } = req.body;

    const klass = await Class.findById(classId);
    if (!klass) return res.status(404).json({ message: "Không tìm thấy lớp" });

    klass.teachers = klass.teachers.filter((t) => t.toString() !== teacherId);
    await klass.save();

    res.status(200).json({ message: "Xóa giáo viên khỏi lớp thành công", class: klass });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};
