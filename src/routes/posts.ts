import express, { Request, Response } from "express";
import PostsSearchHelper from "../helpers/posts-search-helper";
import ResponseHelper from "../helpers/response-helper";
import TagsHelper from "../helpers/tags-helper";
import { validateToken } from "../middleware/auth-mw";
import sequelizeDb from "../models";
import DbPost from "../types/app/DbPost";
import DbUser from "../types/app/DbUser";

const router = express.Router();
const { posts: postsTable, users: usersTable } = sequelizeDb;

router.get("/", async (req: Request, res: Response) => {
  const options = PostsSearchHelper.getQueryOptions(req);

  const data: DbPost[] = await postsTable.findAll(options);
  ResponseHelper.success(res, data);
});

router.get("/by-user/:id", async (req: Request, res: Response) => {
  const dbUser: DbUser = await usersTable.findByPk(req.params["id"]);
  if (!dbUser) {
    ResponseHelper.entityNotFound(res);
    return;
  }

  const data: DbPost[] = await postsTable.findAll({
    where: { userId: dbUser.id },
  });
  ResponseHelper.success(res, data);
});

router.post("/", validateToken, async (req: Request, res: Response) => {
  let newPost: DbPost = await postsTable.create({
    ...req.body,
    userId: req.user?.id,
  });

  await TagsHelper.associate(newPost, req.body.tags);

  const data: DbPost = await postsTable.findByPk(newPost.id);
  ResponseHelper.success(res, data);
});

router.get("/:id", async (req: Request, res: Response) => {
  const dbPost: DbPost = await postsTable.findByPk(req.params["id"]);

  if (!dbPost) {
    ResponseHelper.entityNotFound(res);
    return;
  }

  ResponseHelper.success(res, dbPost);
});

router.put("/:id", validateToken, async (req: Request, res: Response) => {
  let dbPost: DbPost = await postsTable.findByPk(req.params["id"]);

  if (!dbPost) {
    ResponseHelper.entityNotFound(res);
    return;
  }
  if (dbPost.user.id !== req.user?.id) {
    ResponseHelper.entityNotOwned(res);
    return;
  }

  await TagsHelper.associate(dbPost, req.body.tags);

  await dbPost.update(req.body);

  const data: DbPost = await postsTable.findByPk(req.params["id"]);
  ResponseHelper.success(res, data);
});

router.delete("/:id", validateToken, async (req: Request, res: Response) => {
  const dbPost: DbPost = await postsTable.findByPk(req.params["id"]);

  if (!dbPost) {
    ResponseHelper.entityNotFound(res);
    return;
  }
  if (dbPost.user.id !== req.user?.id) {
    ResponseHelper.entityNotOwned(res);
    return;
  }

  await dbPost.setTags([]);

  await dbPost.destroy();
  ResponseHelper.entityDeleted(res);
});

module.exports = router;
