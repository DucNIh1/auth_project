import jwt from "jsonwebtoken";

export const generateTokenAndCookie = (res, userId) => {
  const token = jwt.sign({ userId: userId }, "hehehe", {
    expiresIn: 3600 * 1, // 1days
  });

  res.cookie("token", token, {
    httpOnly: true, // Cookie chỉ có thể được truy cập bởi máy chủ
    maxAge: 24 * 60 * 60 * 1000, // Thời gian tồn tại của cookie (1 ngày)
    secure: process.env.NODE_ENV === "production", //Cookie chỉ được gửi qua HTTPS
    sameSite: "Strict", // Giảm thiểu rủi ro CSRF
  });
  return token;
};
