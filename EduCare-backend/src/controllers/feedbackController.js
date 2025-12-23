import Feedback from "../models/Feedback.js";

/**
 * 🧑‍🏫 Teacher tạo hoặc cập nhật feedback
 */
export const createOrUpdateFeedback = async (req, res) => {
  try {
    const teacherId = req.user._id;

    const {
      studentId,
      classId,
      activityDateId,
      activityItemId,
      date,
      comment,
      reward,
    } = req.body;

    if (
      !studentId ||
      !classId ||
      !activityDateId ||
      !activityItemId ||
      !date
    ) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    const feedback = await Feedback.findOneAndUpdate(
      { studentId, activityItemId, date },
      {
        studentId,
        classId,
        activityDateId,
        activityItemId,
        teacherId,
        date,
        comment: comment || "",
        reward: reward || "none",
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      message: "Feedback saved successfully",
      data: feedback,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * 👨‍👩‍👧 Parent xem feedback của con
 */
export const getFeedbackByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    const feedbacks = await Feedback.find({ studentId })
      .populate("teacherId", "name")
      .populate("activityDateId") // 👈 lấy cả ngày
      .sort({ date: -1, createdAt: -1 });

    res.status(200).json(feedbacks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
/**
 * 🧑‍🏫 Teacher xem feedback theo lớp + ngày
 */
export const getFeedbackByClassAndDate = async (req, res) => {
  try {
    const { classId, date } = req.query;

    if (!classId || !date) {
      return res.status(400).json({
        message: "Missing classId or date",
      });
    }

    const feedbacks = await Feedback.find({ classId, date })
      .populate("studentId", "name")
      .populate("teacherId", "name")
      .sort({ createdAt: -1 });

    res.status(200).json(feedbacks);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

export const getFeedbackDetail = async (req, res) => {
  const { studentId, activityItemId, date } = req.query;

  const feedback = await Feedback.findOne({
    studentId,
    activityItemId,
    date,
  });

  res.status(200).json(feedback);
};

export const getFeedbackStats = async (req, res) => {
  try {
    const { classId, from, to } = req.query;

    if (!classId || !from || !to) {
      return res.status(400).json({
        message: "Missing classId / from / to",
      });
    }

    const matchStage = {
      classId: new mongoose.Types.ObjectId(classId),
      date: { $gte: from, $lte: to },
      reward: { $ne: "none" },
    };

    // ================= SUMMARY =================
    const summaryAgg = await Feedback.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$reward",
          count: { $sum: 1 },
        },
      },
    ]);

    const summary = {
      star: 0,
      flower: 0,
      badge: 0,
    };

    summaryAgg.forEach((i) => {
      summary[i._id] = i.count;
    });

    // ================= RANKING =================
    const rankingAgg = await Feedback.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$studentId",
          star: {
            $sum: { $cond: [{ $eq: ["$reward", "star"] }, 1, 0] },
          },
          flower: {
            $sum: { $cond: [{ $eq: ["$reward", "flower"] }, 1, 0] },
          },
          badge: {
            $sum: { $cond: [{ $eq: ["$reward", "badge"] }, 1, 0] },
          },
        },
      },
      {
        $addFields: {
          total: { $add: ["$star", "$flower", "$badge"] },
        },
      },
      { $sort: { total: -1 } },
      {
        $lookup: {
          from: "students",
          localField: "_id",
          foreignField: "_id",
          as: "student",
        },
      },
      { $unwind: "$student" },
      {
        $project: {
          studentId: "$_id",
          name: "$student.name",
          star: 1,
          flower: 1,
          badge: 1,
          total: 1,
        },
      },
    ]);

    res.status(200).json({
      summary,
      ranking: rankingAgg,
    });
  } catch (err) {
    console.error("❌ getFeedbackStats error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getTeacherRewardStats = async (req, res) => {
  try {
    const teacherId = req.user._id;
    const { from, to } = req.query;

    const match = {
      teacherId,
    };

    if (from && to) {
      match.date = { $gte: from, $lte: to }; // vì date là string YYYY-MM-DD
    }

    const stats = await Feedback.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$reward",
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      star: stats.find(s => s._id === "star")?.count || 0,
      flower: stats.find(s => s._id === "flower")?.count || 0,
      badge: stats.find(s => s._id === "badge")?.count || 0,
    });
  } catch (err) {
    console.error("❌ Stats error:", err);
    res.status(500).json({ message: err.message });
  }
};