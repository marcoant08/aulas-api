import mongoose from "../database";
import bcrypt from "bcryptjs";

interface IUser extends mongoose.Document {
  name: string;
  email: string;
  password?: string;
  date_created: Date;
}

const UserSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    date_created: {
      type: Date,
      default: new Date(),
      select: false,
      required: true,
    },
  },
  { timestamps: { createdAt: "date_created", updatedAt: "date_updated" } }
);

UserSchema.pre<IUser>("save", async function (next) {
  const hash = await bcrypt.hash(this.password as string, 10);
  this.password = hash;

  next();
});

const User = mongoose.model<IUser>("User", UserSchema);

export default User;
