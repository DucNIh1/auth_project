import {
  sendPasswordResetEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
  sendResetSuccessEmail,
} from "../mailtrap/emails.js";
import User from "../models/User.js";
import AppError from "../utils/appError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { generateTokenAndCookie } from "../utils/generateTokenAndCookie.js";
import crypto from "crypto";

export const signup = catchAsync(async (req, res, next) => {
  const { email, password, name } = req.body;

  const userAlreadyExists = await User.findOne({ email });

  if (userAlreadyExists) {
    return res
      .status(400)
      .json({ status: "failed", message: "User already exists" });
  }

  // Tạo ra mã gồm 6 số để xác minh email
  const verificationToken = Math.floor(
    100000 + Math.random() * 900000
  ).toString();

  // tạo mới user
  const user = await User.create({
    email,
    password,
    name,
    verificationToken: verificationToken,
    verificationTokenExpiresAt: Date.now() + 3600 * 24, // 24h
  });

  //Tạo jwt và lưu vô cookie
  const token = generateTokenAndCookie(res, user._id);

  // Gửi token qua mail để xác minh tài khoản
  await sendVerificationEmail(email, verificationToken);

  res.status(201).json({
    status: "success",
    token,
    data: {
      user: user,
    },
  });
});

export const verificationEmail = catchAsync(async (req, res, next) => {
  // lay ma code nguoi dung nhap 6 chu so
  const { code } = req.body;
  const user = await User.findOne({
    verificationToken: code,
    verificationTokenExpiresAt: {
      $gt: Date.now(),
    },
  });

  if (!user) return next(new AppError("The code is not valid or expired", 400));

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpiresAt = undefined;

  // Lưu thay đổi vào cơ sở dữ liệu
  await user.save();

  await sendWelcomeEmail(user.email, user.name);
  res.status(200).json({
    status: "success",
    message: "Verification token successfully",
    data: { user: user },
  });
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email) return next(new AppError("Please enter your email address", 400));
  if (!password) return next(new AppError("Please enter your password", 400));

  const user = await User.findOne({ email }).select("+password");
  console.log(user);

  // Kiểm tra password bằng methods tạo trong model
  if (!user || !(await user.comparePasswords(password, user.password))) {
    return next(new AppError("Email or password is incorrect", 401));
  }

  // thay đổi time login lần cuối
  user.lastLogin = new Date();
  await user.save();

  const token = generateTokenAndCookie(res, user._id);

  res.status(200).json({
    status: "success",
    token: token,
    data: {
      user: user,
    },
  });
});

export const logout = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

export const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email });

  if (!user) return next(new AppError("Invalid email address!", 400));

  // Tao reset token
  const resetToken = crypto.randomBytes(32).toString("hex");
  console.log(resetToken);
  const resetTokenExpiresAt = Date.now() + 60 * 60 * 1000; // 1h

  user.resetPasswordExpiresAt = resetTokenExpiresAt;
  user.resetPasswordToken = resetToken;
  await user.save();

  await sendPasswordResetEmail(
    email,
    `http://localhost:5173/reset-password/${resetToken}`
  );
  res.status(200).json({ status: "success", message: "Check your email!" });
});

export const resetPassword = catchAsync(async (req, res, next) => {
  const { password } = req.body;
  const token = req.params.token;
  console.log(token);

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpiresAt: {
      $gt: Date.now(),
    },
  });

  if (!user) return next(new AppError("invalid token or user", 401));

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpiresAt = undefined;
  await user.save();

  await sendResetSuccessEmail(user.email);
  res
    .status(200)
    .json({ status: "success", message: "Password reset successfully" });
});

export const checkAuth = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.userId).select("-password");

  if (!user) return next(new AppError("User not found", 404));

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});
