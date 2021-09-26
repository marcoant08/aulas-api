import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user";
const authConfig = require("../config/auth");

interface Custom {
  statusCode: number;
  message: string;
}

class CustomError extends Error {
  statusCode: number;

  constructor(options: Custom) {
    super();
    this.statusCode = options.statusCode;
    this.message = options.message;
  }
}

const generateToken = (params = {}) =>
  jwt.sign(params, authConfig.secret, {
    expiresIn: 7200, // expira em 2 horas
  });

export default class UserController {
  async create(req: Request, res: Response) {
    const { name, email, password } = req.body;

    try {
      if (!(name && email && password)) {
        throw new CustomError({
          message: "One or more missing fields",
          statusCode: 400,
        });
      }

      if (await User.findOne({ email })) {
        throw new CustomError({
          message: "User already exists",
          statusCode: 400,
        });
      }

      let user = await User.create({ name, email, password });
      user.password = undefined;

      const token = generateToken({ _id: user._id });

      return res.status(201).json({ user, token });
    } catch (e) {
      const err = e as CustomError;
      console.log(err);
      return res.status(err.statusCode || 500).send({ error: err.message });
    }
  }

  async login(req: Request, res: Response) {
    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email }).select("+password");

      if (!user) {
        throw new CustomError({
          message: "User not found",
          statusCode: 404,
        });
      }

      if (!(await bcrypt.compare(password, user.password as string))) {
        throw new CustomError({
          message: "Invalid password",
          statusCode: 401,
        });
      }

      user.password = undefined;

      const token = generateToken({ _id: user._id });

      return res.status(200).json({ user, token });
    } catch (e) {
      const err = e as CustomError;
      console.log(err);
      return res.status(err.statusCode || 500).send({ error: err.message });
    }
  }
}
