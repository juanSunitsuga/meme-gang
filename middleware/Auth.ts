import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { appConfig } from "../config/app";
import { middlewareWrapper } from "../utils/middlewareWrapper";
import { tokenBlacklist } from "./Verify";

const authMiddleware = middlewareWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      res.locals.errorCode = 401;
      throw new Error("No token provided");
    }

    if (tokenBlacklist.has(token)) {
      res.locals.errorCode = 401;
      throw new Error("Token is blacklisted");
    }

    const decoded = jwt.verify(token, appConfig.jwtSecret) as {
      id: string;
      email?: string;
      name?: string;
    };

    if (!decoded?.id) {
      res.locals.errorCode = 401;
      throw new Error("Invalid token structure");
    }

    req.user = {
      id: decoded.id,
      username: decoded.name || "",
      email: decoded.email || "",
    };
  }
);

export default authMiddleware;
