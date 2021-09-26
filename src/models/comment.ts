import mongoose from "../database";

interface IComment extends mongoose.Document {
  id_class: string;
  comment: string;
  date_created: Date;
}

const CommentSchema = new mongoose.Schema<IComment>(
  {
    id_class: {
      type: String,
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
  },
  { timestamps: { createdAt: "date_created", updatedAt: "date_updated" } }
);

const Comment = mongoose.model<IComment>("Comment", CommentSchema);

export default Comment;
