import mongoose from "../database";

interface IClass extends mongoose.Document {
  name: string;
  description: string;
  video: string;
  data_init: Date;
  data_end: Date;
  date_created: Date;
  date_updated: Date;
  total_comments: number;
}

const ClassSchema = new mongoose.Schema<IClass>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    video: {
      type: String,
      required: true,
    },
    data_init: {
      type: Date,
      required: true,
    },
    data_end: {
      type: Date,
      required: true,
    },
    total_comments: {
      type: Number,
      default: 0,
      required: true,
    },
  },
  { timestamps: { createdAt: "date_created", updatedAt: "date_updated" } }
);

const Class = mongoose.model<IClass>("Class", ClassSchema);

export default Class;
