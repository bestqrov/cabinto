import type { Request, Response, NextFunction } from "express";
import User from "../models/User";
import { verifyToken } from "../libs/token";

declare global {
  namespace Express {
    interface Request {
      user: any;
    }
  }
}

export async function isAuthenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const cookieToken = req.cookies?.token;
    const authHeader = req.headers.authorization;
    const headerToken =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null;

    const token = cookieToken || headerToken;

    if (!token) {
      return res.status(401).json({ error: "غير مصرح بك" });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ error: "رمز تحقق غير صالح" });
    }

    const user = await User.findById(decoded._id);

    if (!user) {
      return res.status(404).json({ error: "المستخدم غير موجود" });
    }
    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "حدث خطأ في طرف خادم" });
  }
}