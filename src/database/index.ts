import mongoose from "mongoose";

mongoose.connect("mongodb://localhost/tindin_db");
mongoose.Promise = global.Promise;

export default mongoose;
