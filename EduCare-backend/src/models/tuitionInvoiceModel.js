// models/tuitionInvoiceModel.js
import mongoose from "mongoose";

const tuitionInvoiceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },

    month: { type: Number, required: true },
    year: { type: Number, required: true },

    // 👇 CHI TIẾT PHÍ
    items: [
      {
        key: String,     // tuition | meal | facility | electricity
        name: String,    // Tên hiển thị
        amount: Number,
      }
    ],

    totalAmount: { type: Number, required: true },

    status: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },
    
    paidDate: Date,
  },
  { timestamps: true }
);

// ✅ UNIQUE INVOICE / STUDENT / MONTH
tuitionInvoiceSchema.index(
  { student: 1, month: 1, year: 1 },
  { unique: true }
);

export default mongoose.model("TuitionInvoice", tuitionInvoiceSchema);
