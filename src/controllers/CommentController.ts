import { Request, Response } from "express";
import Class from "../models/class";
import Comment from "../models/comment";

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

export default class CommentController {
  async create(req: Request, res: Response) {
    try {
      const { comment } = req.body;
      const { id_class } = req.params;

      if (!comment) {
        throw new CustomError({
          message: "Missing fields: comment",
          statusCode: 400,
        });
      }

      if (!id_class) {
        throw new CustomError({
          message: "Missing parameter: id_class",
          statusCode: 400,
        });
      }

      const exists = await Class.exists({ _id: id_class }).catch((e) => false);

      if (!exists) {
        throw new CustomError({
          message: `Class ${id_class} not found`,
          statusCode: 404,
        });
      }

      const my_comment = await Comment.create({
        id_class,
        comment,
      });

      await Class.findByIdAndUpdate(id_class, {
        $inc: { total_comments: 1 },
      });

      return res.status(200).json({ comment: my_comment });
    } catch (e) {
      const err = e as CustomError;
      console.log(err);
      return res.status(err.statusCode || 500).send({ error: err.message });
    }
  }

  async getComments(req: Request, res: Response) {
    try {
      const { id_class } = req.params;

      if (!id_class) {
        throw new CustomError({
          message: "missing parameter: id_class",
          statusCode: 400,
        });
      }

      const { page } = req.query;

      if (page && isNaN(Number(page))) {
        throw new CustomError({
          message: "Query parameter error: page must be a number",
          statusCode: 400,
        });
      }

      const exists = await Class.exists({ _id: id_class }).catch((e) => false);

      if (!exists) {
        throw new CustomError({
          message: `Class ${id_class} not found`,
          statusCode: 404,
        });
      }

      const limit = 50;
      const skip = getSkip(page?.toString());

      const total_length = await Comment.count()
        .where("id_class")
        .equals(id_class);

      const comments = await Comment.find()
        .where("id_class")
        .equals(id_class)
        .skip(skip)
        .limit(limit);

      return res.status(200).send({
        current_page: page ? Number(page) : 0,
        current_length: comments.length,
        total_length: total_length,
        comments,
      });
    } catch (e) {
      const err = e as CustomError;
      console.log(err);
      return res.status(err.statusCode || 500).send({ error: err.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id_class, id_comment } = req.params;

      if (!id_comment) {
        throw new CustomError({
          message: "Missing parameter: id_comment",
          statusCode: 400,
        });
      }

      if (!id_class) {
        throw new CustomError({
          message: "Missing parameter: id_class",
          statusCode: 400,
        });
      }

      const exists = await Class.exists({ _id: id_class }).catch((e) => false);

      if (!exists) {
        throw new CustomError({
          message: `Class ${id_class} not found`,
          statusCode: 404,
        });
      }

      const deleted = await Comment.findByIdAndDelete(id_comment);

      if (!deleted) {
        throw new CustomError({
          message: `Comment ${id_comment} not found`,
          statusCode: 404,
        });
      }

      await Class.findByIdAndUpdate(id_class, {
        $inc: { total_comments: -1 },
      });

      return res
        .status(200)
        .json({ message: `Comment ${id_comment} was deleted.` });
    } catch (e) {
      const err = e as CustomError;
      console.log(err);
      return res.status(err.statusCode || 500).send({ error: err.message });
    }
  }
}

export const getSkip = (page?: string) => {
  return 50 * (page ? Number(page) : 0);
};
