import Activity from "../models/Activity.js";

// get activities by classId and date
export const getActivitiesByClassAndDate = async (req, res) => {
  try {
    const { classId, date } = req.params;

    const doc = await Activity.findOne({ classId, date });

    if (!doc) return res.json({ activities: [] });

    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// save activities (create or update  )
export const saveActivities = async (req, res) => {
  try {
    const { classId, date, activities } = req.body;

    if (!classId || !date)
      return res.status(400).json({ message: "Missing classId or date" });

    let doc = await Activity.findOne({ classId, date });

    if (!doc) {
      // Create new
      doc = await Activity.create({ classId, date, activities });
    } else {
      // Update
      doc.activities = activities;
      await doc.save();
    }

    res.json({ message: "Activities saved", data: doc });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
