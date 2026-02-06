// authMiddleware.js
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

    req.user = {
      uid: decoded.uid,
      email: decoded.email || `${decoded.uid}@phone.firebase`,
      phone: decoded.phone_number || null,
      name: decoded.name || decoded.displayName || "Anonymous",
      picture: decoded.picture || null, 
    };

    // Check DB để lấy info chi tiết (role, children...) cho các route khác
    // Nếu là route /login thì bỏ qua bước này để Controller tự xử lý tạo/update
    if (!req.originalUrl.includes("/user/login") && !req.originalUrl.includes("/user/sync")) {
      const user = await User.findOne({ uid: decoded.uid });
      
      if (user) {
        // Nếu tìm thấy trong DB thì ghi đè req.user bằng info đầy đủ từ DB
        req.user = user;
      } else {
        //  Nếu là login bằng phone nhưng chưa có user → auto tạo luôn
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
      } 
    }

    next();
  } catch (err) {
    console.error("❌ verifyFirebaseToken error:", err.message);
    return res.status(401).json({ message: "Invalid or expired Firebase token" });
  }
};
