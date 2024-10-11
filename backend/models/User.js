import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Please tell us your email address"],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Please tell us your password"],
      minLength: [8, "Pasword length must be at least 8 characters"],
      select: false,
    },
    name: {
      type: String,
      required: true,
      required: [true, "Please tell us your name"],
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    verificationToken: String, // mã để xác minh email
    verificationTokenExpiresAt: Date,
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  // Nếu mật khẩu không thay đổi, bỏ qua và tiếp tục
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePasswords = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model("User", userSchema);
export default User;
