import Feedback from "../models/Feedback.js";
import mongoose from "mongoose";
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

    console.log("📊 STATS PARAMS:", { classId, from, to });

    if (!classId || !from || !to) {
      return res.status(400).json({ message: "Missing params" });
    }

    /** ================= SUMMARY ================= */
    const summaryAgg = await Feedback.aggregate([
      {
        $match: {
          classId: new mongoose.Types.ObjectId(classId),
          date: { $gte: from, $lte: to },
          reward: { $ne: "none" },
        },
      },
      {
        $group: {
          _id: "$reward",
          count: { $sum: 1 },
        },
      },
    ]);

    console.log("📊 RAW SUMMARY AGG:", summaryAgg);

    const summary = { star: 0, flower: 0, badge: 0 };
    summaryAgg.forEach((i) => {
      summary[i._id] = i.count;
    });

    /** ================= RANKING ================= */
    const rankingAgg = await Feedback.aggregate([
      {
        $match: {
          classId: new mongoose.Types.ObjectId(classId),
          date: { $gte: from, $lte: to },
          reward: { $ne: "none" }, // Chỉ lấy cái nào có thưởng
        },
      },
      // 1. Gom nhóm theo Student + Reward
      {
        $group: {
          _id: { studentId: "$studentId", reward: "$reward" },
          count: { $sum: 1 },
        },
      },
      // 2. Gom nhóm lại theo Student để tạo mảng rewards
      {
        $group: {
          _id: "$_id.studentId",
          rewards: {
            $push: {
              reward: "$_id.reward",
              count: "$count",
            },
          },
          totalCount: { $sum: "$count" } // 🔥 Thêm dòng này để dễ sort ranking
        },
      },
      // 3. Join với bảng students
      {
        $lookup: {
          from: "students", // ⚠️ LƯU Ý: Đảm bảo tên collection trong MongoDB là "students"
          localField: "_id",
          foreignField: "_id",
          as: "student",
        },
      },
      { $unwind: "$student" }, // Nếu không tìm thấy student, dòng này sẽ loại bỏ record đó.
      { $sort: { totalCount: -1 } } // 🔥 Sắp xếp học sinh có nhiều huy hiệu nhất lên đầu
    ]);

    console.log("📊 RAW RANKING AGG:", rankingAgg);

    const ranking = rankingAgg.map((r) => {
      const base = { star: 0, flower: 0, badge: 0 };
      r.rewards.forEach((rw) => (base[rw.reward] = rw.count));

      return {
        studentId: r._id,
        name: r.student.name,
        ...base,
      };
    });

    res.status(200).json({
      summary,
      ranking,
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