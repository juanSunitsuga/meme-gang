import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { appConfig } from "../config/app";
import { middlewareWrapper } from "../utils/middlewareWrapper";

const authMiddleware = middlewareWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      res.locals.errorCode = 401;
      throw new Error("No token provided");
    }

    try {
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
    } catch (error: any) {
      res.locals.errorCode = 401;

      // Specific error handling for different JWT verification failures
      if (error.name === "TokenExpiredError") {
        throw new Error(`Token expired at ${error.expiredAt}`);
      } else if (error.name === "JsonWebTokenError") {
        throw new Error("Invalid token signature");
      } else if (error.name === "NotBeforeError") {
        throw new Error("Token not active yet");
      }

      throw new Error("Token verification failed");
    }
  }
);

export default authMiddleware;
