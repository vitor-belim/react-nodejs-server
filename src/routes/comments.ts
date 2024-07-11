import express, { Request, Response } from "express";
import { FindOptions } from "sequelize";
import PaginationHelper from "../helpers/pagination-helper";
import ResponseHelper from "../helpers/response-helper";
import { validateOptionalToken, validateToken } from "../middleware/auth-mw";
import sequelizeDb from "../models";
import DbComment from "../types/app/db-objects/DbComment";
import Comment from "../types/app/db-objects/simple/Comment";

const router = express.Router();
const { comments: commentsTable, posts: postsTable } = sequelizeDb;

const postCommentsDisabledResponse = (res: Response) =>
  ResponseHelper.error(res, "Comments are disabled for this post", 403);

router.get(
  "/:postId",
  validateOptionalToken,
  async (req: Request, res: Response) => {
    const dbPost = await postsTable.findByPk(req.params["postId"]);

    if (!dbPost) {
      ResponseHelper.entityNotFound(res);
      return;
    }
    if (
      !dbPost.allowComments &&
      (!req.user || dbPost.user.id !== req.user.id)
    ) {
      postCommentsDisabledResponse(res);
      return;
    }

    const options: FindOptions<Comment> = { where: { postId: dbPost.id } };
    const paginatedResponse = await PaginationHelper.getPaginatedResponse(
      req,
      commentsTable,
      options,
    );
    ResponseHelper.success(res, paginatedResponse);
  },
);

router.post("/:postId", validateToken, async (req: Request, res: Response) => {
  const dbPost = await postsTable.findByPk(req.params["postId"]);

  if (!dbPost) {
    ResponseHelper.entityNotFound(res);
    return;
  }
  if (!dbPost.allowComments) {
    postCommentsDisabledResponse(res);
    return;
  }

  const newComment = await commentsTable.create({
    ...req.body,
    postId: dbPost.id,
    userId: req.user?.id,
  });

  const dbComment: DbComment = await commentsTable.findByPk(newComment.id);
  ResponseHelper.success(res, dbComment);
});

router.delete("/:id", validateToken, async (req: Request, res: Response) => {
  let dbComment = await commentsTable.findByPk(req.params["id"]);

  if (!dbComment) {
    ResponseHelper.entityNotFound(res);
    return;
  }

  if (
    dbComment.user.id !== req.user?.id &&
    dbComment.post.user.id !== req.user?.id
  ) {
    ResponseHelper.entityNotOwned(res);
    return;
  }

  await dbComment.destroy();
  ResponseHelper.entityDeleted(res);
});

module.exports = router;
