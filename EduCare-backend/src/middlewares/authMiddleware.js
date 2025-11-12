import admin from "../firebaseAdmin.js";
import User from "../models/User.js";

export const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const idToken = authHeader.split(" ")[1];
    const decoded = await admin.auth().verifyIdToken(idToken);

    // ✅ Dữ liệu đồng bộ cho mọi loại login (email, phone, google)
    req.firebaseUser = {
      uid: decoded.uid,
      email: decoded.email || `${decoded.uid}@phone.firebase`, // fallback nếu login bằng số điện thoại
      phone: decoded.phone_number || null,
      name: decoded.name || decoded.displayName || "Anonymous",
    };

    // ⚙️ Chỉ check DB khi KHÔNG phải route /user/login hoặc /user/sync
    if (!req.originalUrl.includes("/user/login") && !req.originalUrl.includes("/user/sync")) {
      const user = await User.findOne({ uid: decoded.uid });
      if (!user) {
        // ✅ Nếu là login bằng phone nhưng chưa có user → auto tạo luôn
        const newUser = await User.create({
          uid: decoded.uid,
          email: req.firebaseUser.email,
          phone: req.firebaseUser.phone,
          name: req.firebaseUser.name,
          role: "parent",
          isActive: true,
        });
        req.user = newUser;
        console.log("🆕 Created new user via phone auth:", newUser.email);
      } else {
        req.user = user;
      }
    }

    next();
  } catch (err) {
    console.error("❌ verifyFirebaseToken error:", err.message);
    return res.status(401).json({ message: "Invalid or expired Firebase token" });
  }
};
