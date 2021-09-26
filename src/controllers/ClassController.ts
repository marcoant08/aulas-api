import { Request, Response } from "express";
import Class from "../models/class";
import Comment from "../models/comment";

interface Custom {
  statusCode: number;
  message: string;
}

interface IClassAux {
  name?: string;
  description?: string;
  video?: string;
  data_init?: Date;
  data_end?: Date;
}

class CustomError extends Error {
  statusCode: number;

  constructor(options: Custom) {
    super();
    this.statusCode = options.statusCode;
    this.message = options.message;
  }
}

export default class ClassController {
  async create(req: Request, res: Response) {
    try {
      if (!createValidation(req.body)) {
        throw new CustomError({
          message: "One or more missing fields",
          statusCode: 400,
        });
      }

      const { name, description, video, data_init, data_end } = req.body;

      const my_class = await Class.create({
        name,
        description,
        video,
        data_init,
        data_end,
      });

      return res.status(200).json({ class: my_class });
    } catch (e) {
      const err = e as CustomError;
      console.log(err);
      return res.status(err.statusCode || 500).send({ error: err.message });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const { page } = req.query;

      if (page && isNaN(Number(page))) {
        throw new CustomError({
          message: "Query parameter error: page must be a number",
          statusCode: 400,
        });
      }

      const limit = 50;
      const skip = limit * (page ? Number(page) : 0);

      const total_length = await Class.count();
      const classes = await Class.find().skip(skip).limit(limit);

      const comments = classes.map(async (c) =>
        Comment.find()
          .where("id_class")
          .equals(c._id)
          .sort({ date_created: -1 })
          .limit(1)
          .exec()
      );

      const result = await Promise.all(comments);

      const with_comments = classes.map((c) => {
        let comment = result.find((r) => r[0]?.id_class === c._id.toString());

        comment = comment ?? [];

        return {
          _id: c._id,
          name: c.name,
          description: c.description,
          video: c.video,
          data_init: c.data_init,
          data_end: c.data_end,
          date_created: c.date_created,
          date_updated: c.date_updated,
          total_comments: c.total_comments,
          last_comment: comment.length > 0 ? comment[0].comment : null,
          last_comment_date:
            comment.length > 0 ? comment[0].date_created : null,
        };
      });

      return res.status(200).json({
        current_page: page ? Number(page) : 0,
        current_length: with_comments.length,
        total_length: total_length,
        classes: with_comments,
      });
    } catch (e) {
      const err = e as CustomError;
      console.log(err);
      return res.status(err.statusCode || 500).send({ error: err.message });
    }
  }

  async getOne(req: Request, res: Response) {
    try {
      const { id_class } = req.params;

      const my_class = await Class.findById(id_class).catch((err) => null);

      if (!my_class) {
        throw new CustomError({
          message: "Class not found",
          statusCode: 404,
        });
      }

      const comments = await Comment.find()
        .where("id_class")
        .equals(id_class)
        .sort({ date_created: -1 })
        .limit(3)
        .exec();

      const with_comments = {
        _id: my_class._id,
        name: my_class.name,
        description: my_class.description,
        video: my_class.video,
        data_init: my_class.data_init,
        data_end: my_class.data_end,
        date_created: my_class.date_created,
        date_updated: my_class.date_updated,
        total_comments: my_class.total_comments,
        comments,
      };

      return res.status(200).json({ class: with_comments });
    } catch (e) {
      const err = e as CustomError;
      console.log(err);
      return res.status(err.statusCode || 500).send({ error: err.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id_class } = req.params;

      if (!updateValidation(req.body)) {
        throw new CustomError({
          message: "Missing valid fields",
          statusCode: 400,
        });
      }

      const exists = await Class.exists({ _id: id_class }).catch(() => false);

      if (!exists) {
        throw new CustomError({
          message: `Class ${id_class} not found`,
          statusCode: 404,
        });
      }

      const updated_class = await Class.findByIdAndUpdate(
        id_class,
        getValidFields(req.body),
        { returnOriginal: false }
      );

      return res.status(200).json({ class: updated_class });
    } catch (e) {
      const err = e as CustomError;
      console.log(err);
      return res.status(err.statusCode || 500).send({ error: err.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id_class } = req.params;

      const deleted = await Class.findByIdAndDelete(id_class).catch(() => null);

      if (!deleted) {
        throw new CustomError({
          message: `Class ${id_class} not found`,
          statusCode: 404,
        });
      }

      return res
        .status(200)
        .json({ message: `Class ${id_class} was deleted.` });
    } catch (e) {
      const err = e as CustomError;
      console.log(err);
      return res.status(err.statusCode || 500).send({ error: err.message });
    }
  }
}

export const getValidFields = (data: { [key: string]: IClassAux }) => {
  const VALID_FIELDS = [
    "name",
    "description",
    "video",
    "data_init",
    "data_end",
  ];

  let fields: { [key: string]: IClassAux } = {};
  for (let key in data) {
    if (VALID_FIELDS.includes(key)) fields[key] = data[key];
  }

  return fields;
};

export const createValidation = (body: IClassAux) => {
  const { name, description, video, data_init, data_end } = body;

  return name && description && video && data_init && data_end ? true : false;
};

export const updateValidation = (body: IClassAux) => {
  const { name, description, video, data_init, data_end } = body;

  return name || description || video || data_init || data_end ? true : false;
};
