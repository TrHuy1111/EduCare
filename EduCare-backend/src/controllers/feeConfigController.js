// controllers/feeConfigController.js
import FeeConfig from "../models/feeConfigModel.js";

export const upsertFeeConfig = async (req, res) => {
  const { month, year, levelFees, extraFees } = req.body;

  if (!Array.isArray(levelFees) || levelFees.length === 0) {
    return res.status(400).json({ message: "Phải cấu hình học phí theo level" });
    }

  if (!month || !year) {
    return res.status(400).json({ message: "Month & year required" });
  }

  const config = await FeeConfig.findOneAndUpdate(
    { month, year },
    {
      month,
      year,
      levelFees,
      extraFees
    },
    { upsert: true, new: true }
  );

  res.json(config);
};

export const getFeeConfig = async (req, res) => {
  const { month, year } = req.query;
  const config = await FeeConfig.findOne({ month, year });
  res.json(config);
};
