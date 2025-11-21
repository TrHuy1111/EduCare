//src\controllers\userController.js
import User from '../models/User.js';

/** 🟢 Lấy danh sách toàn bộ user */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-__v');
    res.status(200).json(users);
  } catch (err) {
    console.error('❌ getAllUsers error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/** 🔴 Vô hiệu hoá / kích hoạt tài khoản */
export const toggleUserStatus = async (req, res) => {
  try {
    const { userId, isActive } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true }
    );

    if (!updatedUser)
      return res.status(404).json({ message: 'User not found' });

    res.status(200).json({
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: updatedUser,
    });
  } catch (err) {
    console.error('❌ toggleUserStatus error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


export const createOrUpdateUser = async (req, res) => {
  try {
    const { uid, email, name } = req.body;

    if (!uid || !email) {
      return res.status(400).json({ message: 'UID and Email are required' });
    }

    let user = await User.findOne({ uid });

    if (!user) {
      user = await User.create({ uid, email, name });
      return res.status(201).json({ message: 'User created', user });
    }

    user.email = email;
    user.name = name || user.name;
    await user.save();

    res.status(200).json({ message: 'User updated', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const loginOrRegister = async (req, res) => {
  try {
    const fbUser = req.firebaseUser;
    if (!fbUser) {
      return res.status(400).json({ message: "Missing Firebase user" });
    }

    let user = await User.findOne({ uid: fbUser.uid });

    if (!user) {
      user = await User.create({
        uid: fbUser.uid,
        email: fbUser.email,
        phone: fbUser.phone,
        name: fbUser.name || "No Name",
        role: "parent",
        isActive: true,
      });

      console.log("✅ New user created in MongoDB:", user.email);
      return res.status(201).json({ message: "User created", user });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: "Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.",
      });
    }

    console.log("🔁 Existing user logged in:", user.email);
    return res.status(200).json({ message: "User exists", user });
  } catch (err) {
    console.error("❌ Error in loginOrRegister:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};


// ✅ API đổi role
export const updateUserRole = async (req, res) => {
  try {
    const { userId, newRole } = req.body;

    if (!['parent', 'teacher', 'admin'].includes(newRole)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role: newRole },
      { new: true }
    );

    if (!updatedUser) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ message: 'Role updated', user: updatedUser });
  } catch (err) {
    console.error('❌ updateUserRole error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const syncUser = async (req, res) => {
  try {
    const { uid, email, phone, name } = req.firebaseUser;

    // Tìm user theo UID
    let user = await User.findOne({ uid });

    if (!user) {
      // Nếu chưa có thì tạo mới
      user = await User.create({
        uid,
        email: email || `${uid}@phone.firebase`, // fallback cho OTP login
        phone,
        name,
        role: "parent",
        isActive: true,
      });
    } else {
      // Nếu đã tồn tại thì cập nhật lại tên/số điện thoại (nếu cần)
      user.name = name || user.name;
      if (phone) user.phone = phone;
      await user.save();
    }

    res.status(200).json({
      message: "User synced successfully",
      user,
    });
  } catch (err) {
    console.error("❌ syncUser error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
//future feature: assign teacher to class
export const assignTeacherToClass = async (req, res) => {
  const { userId, classId } = req.body;
  const teacher = await User.findById(userId);
  if (!teacher || teacher.role !== 'teacher')
    return res.status(400).json({ message: 'User is not a teacher' });

  teacher.class = classId;
  await teacher.save();
  res.status(200).json({ message: 'Teacher assigned to class', teacher });
};
// ✅ Lấy danh sách giáo viên
export const getTeachers = async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher', isActive: true })
      .select('name email _id'); // chỉ lấy vài trường cần thiết

    res.status(200).json(teachers);
  } catch (err) {
    console.error('❌ Error getTeachers:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
// ✅ Lấy thông tin user hiện tại
export const getCurrentUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      role: req.user.role,
      name: req.user.name,
      email: req.user.email,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
};
