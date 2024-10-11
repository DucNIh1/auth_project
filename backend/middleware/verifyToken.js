import jwt from "jsonwebtoken";

import AppError from "../utils/appError.js";

export const verifyToken = async (req, res, next) => {
  const jwtToken = req.cookies.token;

  if (!jwtToken) {
    return next(new AppError("Unauthorized - no token provided", 401));
  }

  try {
    const decoded = await jwt.verify(jwtToken, "hehehe");
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return next(new AppError("Unauthorized - invalid token", 401));
  }
};
