import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Session } from "../models/Session";
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
      const decoded = jwt.verify(token, appConfig.jwtSecret) as { id: string };
      if (!decoded?.id) {
        res.locals.errorCode = 401;
        throw new Error("Invalid token structure");
      }

      // Check for session validity
      const session = await Session.findOne({
        where: { token, userId: decoded.id },
      });

      if (!session) {
        res.locals.errorCode = 401;
        throw new Error("Invalid or expired session");
      }

      req.user = { id: decoded.id };
    } catch (error: any) {
      res.locals.errorCode = 401;

      // Specific expired token check
      if (error.name === "TokenExpiredError") {
        throw new Error(`Token expired at ${error.expiredAt}`);
      }

      throw new Error("Token verification failed");
    }
  }
);

export default authMiddleware;
