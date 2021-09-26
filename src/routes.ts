import express from "express";
import UserController from "./controllers/UserController";
import ClassController from "./controllers/ClassController";
import CommentController from "./controllers/CommentController";
import auth from "./middlewares/auth";

const routes = express.Router();
const userController = new UserController();
const classController = new ClassController();
const commentController = new CommentController();

routes.post("/users/create", userController.create);
routes.post("/users", userController.login);
routes.post("/classes", auth, classController.create);
routes.get("/classes", auth, classController.getAll);
routes.get("/classes/:id_class", auth, classController.getOne);
routes.put("/classes/:id_class", auth, classController.update);
routes.delete("/classes/:id_class", auth, classController.delete);
routes.post("/classes/:id_class/comments", auth, commentController.create);
routes.get("/classes/:id_class/comments", auth, commentController.getComments);
routes.delete(
  "/classes/:id_class/comments/:id_comment",
  auth,
  commentController.delete
);

export default routes;
