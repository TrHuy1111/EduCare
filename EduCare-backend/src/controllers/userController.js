//src\controllers\userController.js
import User from '../models/User.js';

/** 🟢 Lấy danh sách toàn bộ user */
export const getAllUsers = async (req, res) => {
  try {
    const { search, role } = req.query; 
    
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } } 
      ];
    }

    if (role) {
      query.role = role;
    }

    const users = await User.find(query).select("-__v").sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (err) {
    console.error("❌ getAllUsers error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
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
    if (!req.user) {
        return res.status(401).json({ message: "Token invalid" });
    }
    // req.user lấy từ token (do middleware verifyFirebaseToken giải mã)
    const { uid, email } = req.user;
    
    // LOGIC : Ưu tiên lấy name từ Body (Register gửi lên)
    // Nếu body không có thì mới lấy từ Token, cuối cùng là mặc định
    const name = req.body.name || req.user.name || "User"; 
    const phone = req.body.phone || req.user.phone_number;

    let user = await User.findOne({ uid });

    if (!user) {
      user = new User({
        uid,
        email,
        name: name, 
        phone: phone,
        role: "parent",
      });
      await user.save();
    } else {
      if (req.body.name) user.name = req.body.name;
      if (req.body.phone) user.phone = req.body.phone;
      await user.save();
    }

    res.status(200).json({ message: "User synced", user });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
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
// ✅ Lấy danh sách phụ huynh (role = parent)
export const getParents = async (req, res) => {
  try {
    const parents = await User.find({ role: "parent", isActive: true })
      .select("name phone email _id");  // chỉ lấy field cần thiết

    res.status(200).json(parents);
  } catch (err) {
    console.error("❌ getParents error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Lấy thông tin user hiện tại
export const getCurrentUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = await User.findById(req.user._id)
      .populate("children", "name classId"); // 👈 rất quan trọng

    res.status(200).json({
      _id: user._id,
      role: user.role,
      name: user.name,
      phone: user.phone,
      image: user.image,
      email: user.email,
      children: user.children, // 👈 TRẢ RA STUDENTS
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;

    const updateData = {};

    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;

    if (req.file) {
      updateData.image = `/uploads/users/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    ).select("_id uid name email phone role image");

    res.status(200).json({
      message: "Profile updated successfully",
      user,
    });
  } catch (err) {
    console.error("❌ updateUserProfile error:", err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "_id uid name email phone role image"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};