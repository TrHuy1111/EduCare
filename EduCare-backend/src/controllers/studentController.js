import Student from "../models/studentModel.js";

// 🧠 CREATE
export const createStudent = async (req, res) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json({ message: "Student created", student });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🧠 READ - GET all + FILTER
export const getAllStudents = async (req, res) => {
  try {
    const { gender, minAge, maxAge, minHeight, maxHeight, minWeight, maxWeight } = req.query;
    const query = {};

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
    .populate("classId", "name level")
    .populate("teacher", "name email");
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🧠 READ - GET one by ID
export const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Not found" });
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🧠 UPDATE
export const updateStudent = async (req, res) => {
  try {
    const updated = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Student not found" });
    res.json({ message: "Student updated", student: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🧠 DELETE
export const deleteStudent = async (req, res) => {
  try {
    const deleted = await Student.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Student not found" });
    res.json({ message: "Student deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
