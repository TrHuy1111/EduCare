// EduCare-backend/src/controllers/studentController.js

import Student from "../models/studentModel.js";
import User from "../models/User.js";
import Class from "../models/classModel.js";
// 🟢 CREATE STUDENT
export const createStudent = async (req, res) => {
  try {
    const { parents, targetLevel, joinedDate } = req.body;

    if (!parents || parents.length === 0) {
      return res.status(400).json({ message: "Student must have at least 1 parent" });
    }
    if (!targetLevel) {
      return res.status(400).json({ message: "Must select a Grade Level (Khối học)" });
    }

    // Tạo student
    const student = await Student.create(req.body);

    // 🔗 Gán student vào User.children (Phụ huynh vẫn cần thấy con mình)
    await User.updateMany(
      { _id: { $in: parents } },
      { $push: { children: student._id } }
    );

    res.status(201).json({ message: "Student profile created", student });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🟡 UPDATE STUDENT (handle parent change)
export const updateStudent = async (req, res) => {
  try {
    const studentId = req.params.id;
    const newData = req.body;

    const oldStudent = await Student.findById(studentId);
    if (!oldStudent) return res.status(404).json({ message: "Student not found" });

    const oldParents = oldStudent.parents.map(id => id.toString());
    const newParents = newData.parents || oldParents;

    // UPDATE STUDENT
    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      newData,
      { new: true }
    );

    // 🔄 XỬ LÝ THAY ĐỔI PARENT
    // parents bị remove
    const removedParents = oldParents.filter(id => !newParents.includes(id));

    // parents được add mới
    const addedParents = newParents.filter(id => !oldParents.includes(id));

    // ❌ Remove student khỏi parent.cũ.children
    if (removedParents.length > 0) {
      await User.updateMany(
        { _id: { $in: removedParents } },
        { $pull: { children: studentId } }
      );
    }

    // ➕ Add student vào parent.mới.children
    if (addedParents.length > 0) {
      await User.updateMany(
        { _id: { $in: addedParents } },
        { $addToSet: { children: studentId } }
      );
    }

    res.json({ message: "Student updated", student: updatedStudent });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// 🟢 GET ALL STUDENTS (FILTERS OK)
export const getAllStudents = async (req, res) => {
  try {
    const { gender, minAge, maxAge, minHeight, maxHeight, minWeight, maxWeight, classId, name } = req.query;
    const query = {};

    if (req.user.role === 'teacher') {
    
      const myClasses = await Class.find({ teachers: req.user._id }).select('_id');
      const myClassIds = myClasses.map(c => c._id);

      query.classId = { $in: myClassIds };
    }

    if (name) {
      query.name = { $regex: name, $options: "i" };
    }
    if (classId) query.classId = classId;

    if (gender) query.gender = gender;

    if (minHeight || maxHeight) query.height = {};
    if (minHeight) query.height.$gte = Number(minHeight);
    if (maxHeight) query.height.$lte = Number(maxHeight);

    if (minWeight || maxWeight) query.weight = {};
    if (minWeight) query.weight.$gte = Number(minWeight);
    if (maxWeight) query.weight.$lte = Number(maxWeight);

    if (minAge || maxAge) {
      const today = new Date();
      query.dob = {};
      if (minAge) {
        const minDate = new Date();
        minDate.setFullYear(today.getFullYear() - Number(minAge));
        query.dob.$lte = minDate;
      }
      if (maxAge) {
        const maxDate = new Date();
        maxDate.setFullYear(today.getFullYear() - Number(maxAge));
        query.dob.$gte = maxDate;
      }
    }

    const students = await Student.find(query)
      .populate({
        path: "classId",
        select: "name level teachers",
        populate: { 
          path: "teachers", 
          select: "name email" 
        }
      })
      .populate("parents", "name phone email")
      .sort({ createdAt: -1 });

    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// 🟢 GET ONE STUDENT
export const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate({
        path: "classId",
        select: "name level teachers",
        populate: {
          path: "teachers",
          select: "name email phone" 
        }
      })
      .populate("parents", "name phone email");

    if (!student) return res.status(404).json({ message: "Not found" });

    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// 🔴 DELETE STUDENT (remove from parents.children)
export const deleteStudent = async (req, res) => {
  try {
    const studentId = req.params.id;

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    // Xóa khỏi parent.children
    await User.updateMany(
      { _id: { $in: student.parents } },
      { $pull: { children: studentId } }
    );

    await Student.findByIdAndDelete(studentId);

    res.json({ message: "Student deleted" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getStudentsForEnrollment = async (req, res) => {
  try {
    const { level } = req.query; // Ví dụ: ?level=infant

    if (!level) {
      return res.status(400).json({ message: "Level is required" });
    }

    const students = await Student.find({
      status: "active",
      targetLevel: level,
      $or: [{ classId: null }, { classId: { $exists: false } }] // Chưa có lớp
    }).select("name dob gender parents isTrial avatar");

    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getMyChildren = async (req, res) => {
  const parentId = req.user._id;

  const students = await Student.find({
    parents: parentId,
    status: "active",
  })
    .select("name classId")
    .populate("classId", "name level");

  res.json(students);
};
