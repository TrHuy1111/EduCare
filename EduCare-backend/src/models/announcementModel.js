import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    title: String,
    content: String,
    image: String,
    location: String,
    startTime: Date,
    endTime: Date,

    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// Virtual field (không lưu DB)
announcementSchema.virtual("likesCount").get(function () {
  return this.likedBy.length;
});

announcementSchema.set("toJSON", { virtuals: true });

export default mongoose.model("Announcement", announcementSchema);
