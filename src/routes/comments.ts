import { Request, Response } from "express";

const express = require("express");
const router = express.Router();
const {
  comments: commentsTable,
  users: usersTable,
  posts: postsTable,
} = require("../models");
const {
  validateToken,
  validateOptionalToken,
} = require("../middleware/auth-mw");
const ResponseHelper = require("../helpers/response-helper");

const postCommentsDisabledResponse = (res: Response) =>
  res.status(403).json({ message: "Post comments are disabled" });

router.get(
  "/:postId",
  validateOptionalToken,
  async (req: Request, res: Response) => {
    const dbPost = await postsTable.findByPk(req.params["postId"]);
    if (
      !dbPost.allowComments &&
      (!req.user || dbPost.user.id !== req.user.id)
    ) {
      postCommentsDisabledResponse(res);
      return;
    }

    res.json(
      await commentsTable.findAll({
        where: { postId: dbPost.id },
        include: usersTable,
      }),
    );
  },
);

router.post("/:postId", validateToken, async (req: Request, res: Response) => {
  const dbPost = await postsTable.findByPk(req.params["postId"]);
  if (!dbPost.allowComments) {
    postCommentsDisabledResponse(res);
    return;
  }

  let newComment = await commentsTable.create({
    ...req.body,
    postId: dbPost.id,
    userId: req.user?.id,
  });
  res.json(await commentsTable.findByPk(newComment.id));
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
