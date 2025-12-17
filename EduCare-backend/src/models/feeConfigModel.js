// models/feeConfigModel.js
import mongoose from "mongoose";

const feeConfigSchema = new mongoose.Schema({
  month: Number,
  year: Number,

  levelFees: [
    {
      level: {
        type: String,
        enum: ["infant", "toddler", "preK2", "preK3", "preK4", "preK5"],
      },
      amount: Number
    }
  ],

  extraFees: [
    {
      key: String,
      name: String,
      amount: Number
    }
  ]
});

export default mongoose.model("FeeConfig", feeConfigSchema);
