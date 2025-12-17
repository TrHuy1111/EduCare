import Announcement from "../models/AnnouncementModel.js";
// 🟢 Create
export const createAnnouncement = async (req, res) => {
  try {
    //console.log("BODY:", req.body);
   //console.log("FILE:", req.file);
    //console.log("USER:", req.user);

    const { title, content, location, startTime, endTime } = req.body;

    const imageUrl = req.file
      ? `/uploads/announcements/${req.file.filename}`
      : null;

    const announcement = await Announcement.create({
      title,
      content,
      location,

      startTime: startTime ? new Date(startTime) : null,
      endTime: endTime ? new Date(endTime) : null,

      image: imageUrl,
      createdBy: req.user._id,
    });

    res.status(201).json({ data: announcement });
  } catch (err) {
    console.error("❌ Create announcement error:", err);
    res.status(500).json({ error: err.message });
  }
};


// 🟢 Trang chủ: sự kiện sắp tới 
export const getUpcomingAnnouncements = async (req, res) => {
  const now = new Date();

  const list = await Announcement.find({
    startTime: { $gte: now }, //  chưa diễn ra
  })
    .sort({ startTime: 1 })   //  gần nhất trước
    .limit(3);

  res.json({ data: list });
};

// 🟢 List tất cả
export const getAllAnnouncements = async (req, res) => {
  const list = await Announcement.find().sort({ createdAt: -1 });
  res.json({ data: list });
};

// 🟢 Detail
export const getAnnouncementById = async (req, res) => {
  const a = await Announcement.findById(req.params.id);
  res.json({ data: a });
};

// 🟡 Update
export const updateAnnouncement = async (req, res) => {
  try {
    const { title, content, location, startTime, endTime } = req.body;

    const updateData = {
      title,
      content,
      location,

      startTime: startTime ? new Date(startTime) : null,
      endTime: endTime ? new Date(endTime) : null,
    };

    if (req.file) {
      updateData.image = `/uploads/announcements/${req.file.filename}`;
    }

    const updated = await Announcement.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json({ data: updated });
  } catch (err) {
    console.error("❌ Update announcement error:", err);
    res.status(500).json({ error: err.message });
  }
};

// 🔴 Delete
export const deleteAnnouncement = async (req, res) => {
  await Announcement.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
};

// ❤️ Like
export const likeAnnouncement = async (req, res) => {
  console.log("LIKE USER:", req.user?.email);
  console.log("LIKE ID:", req.params.id);
  const a = await Announcement.findByIdAndUpdate(
    req.params.id,
    { $inc: { likes: 1 } },
    { new: true }
  );
  res.json({ data: a });
};
