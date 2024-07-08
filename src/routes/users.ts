import express, { Request, Response } from "express";
import ResponseHelper from "../helpers/response-helper";
import sequelizeDb from "../models";
import DbPost from "../types/app/DbPost";
import DbUser from "../types/app/DbUser";

const router = express.Router();
const { posts: postsTable, users: usersTable } = sequelizeDb;

router.get("/:id", async (req: Request, res: Response) => {
  const dbUser: DbUser = await usersTable.findByPk(req.params["id"]);

  if (!dbUser) {
    ResponseHelper.entityNotFound(res);
    return;
  }

  ResponseHelper.success(res, dbUser);
});

router.get("/:id/posts", async (req: Request, res: Response) => {
  const dbUser: DbUser = await usersTable.findByPk(req.params["id"]);
  if (!dbUser) {
    ResponseHelper.entityNotFound(res);
    return;
  }

  const dbPosts: DbPost[] = await postsTable.findAll({
    where: { userId: req.params["id"] },
  });

  ResponseHelper.success(res, dbPosts);
});

module.exports = router;
