import { Request, Response } from "express";
import DbPost from "../types/app/DbPost";
import DbLike from "../types/app/DbLike";

const express = require("express");
const router = express.Router();
const { likes: likesTable, posts: postsTable } = require("../models");
const { validateToken } = require("../middleware/auth-mw");
const ResponseHelper = require("../helpers/response-helper");

router.get("/:postId", async (req: Request, res: Response) => {
  let postId = req.params["postId"];

  res.json(await likesTable.findAll({ where: { postId } }));
});

router.post("/:postId", validateToken, async (req: Request, res: Response) => {
  let postId = req.params["postId"];

  let dbPost: DbPost = await postsTable.findByPk(postId);
  if (!dbPost) {
    ResponseHelper.entityNotFound(res);
    return;
  }

  let userId = req.user?.id;

  let like: DbLike = await likesTable.findOne({
    where: { postId, userId },
  });

  if (!like) {
    like = await likesTable.create({
      userId,
      postId,
    });
    res.json(await likesTable.findByPk(like.id));
  } else {
    await like.destroy();
    res.json({ message: "Like removed" });
  }
});

module.exports = router;
