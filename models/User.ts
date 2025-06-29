import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  image?: string;
  emailVerified?: boolean;
  verificationCode?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  role?: "admin" | "user";  // ✅ add role in interface
}

const UserSchema: Schema = new Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,  
    image: String,     
    emailVerified: { type: Boolean, default: false },
    verificationCode: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    role: { type: String, enum: ["admin", "user"], default: "user" },  // ✅ add role field
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
