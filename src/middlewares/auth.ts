import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import mongoose from "../database";
const authConfig = require("../config/auth");

interface Custom {
  statusCode: number;
  message: string;
}

interface CustomRequest extends Request {
  user_id?: mongoose.Types.ObjectId;
}

class CustomError extends Error {
  statusCode: number;

  constructor(options: Custom) {
    super();
    this.statusCode = options.statusCode;
    this.message = options.message;
  }
}

const auth = (req: CustomRequest, res: Response, next: NextFunction) => {
  const { authorization } = req.headers;

  try {
    if (!authorization) {
      throw new CustomError({
        message: "Missing authorizaton",
        statusCode: 401,
      });
    }

    const parts = authorization.split(" ");

    if (parts.length !== 2) {
      throw new CustomError({
        message: "Authorizaton error",
        statusCode: 401,
      });
    }

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) {
      throw new CustomError({
        message: "Authorizaton malformatted",
        statusCode: 401,
      });
    }

    jwt.verify(token, authConfig.secret, (err: any, decoded: any) => {
      if (err) {
        throw new CustomError({
          message: "Invalid token",
          statusCode: 401,
        });
      }

      req.user_id = decoded._id;
      return next();
    });
  } catch (e) {
    const err = e as CustomError;
    console.log(err);
    return res.status(err.statusCode || 500).json({ error: err.message });
  }
};

export default auth;
