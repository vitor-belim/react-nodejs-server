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

const postCommentsDisabledResponse = (res) =>
  res.status(403).json({ message: "Post comments are disabled" });

router.get("/:postId", validateOptionalToken, async (req, res) => {
  const dbPost = await postsTable.findByPk(+req.params.postId);
  if (!dbPost.allowComments && (!req.user || dbPost.user.id !== req.user.id)) {
    return postCommentsDisabledResponse(res);
  }

  res.json(
    await commentsTable.findAll({
      where: { postId: dbPost.id },
      include: usersTable,
    }),
  );
});

router.post("/:postId", validateToken, async (req, res) => {
  const dbPost = await postsTable.findByPk(+req.params.postId);
  if (!dbPost.allowComments) {
    return postCommentsDisabledResponse(res);
  }

  let newComment = await commentsTable.create({
    ...req.body,
    postId: dbPost.id,
    userId: req.user?.id,
  });
  res.json(await commentsTable.findByPk(newComment.id));
});

router.delete("/:id", validateToken, async (req, res) => {
  let dbComment = await commentsTable.findByPk(req.params.id);

  if (!dbComment) {
    return ResponseHelper.entityNotFound(res);
  }

  if (
    dbComment.user.id !== req.user?.id &&
    dbComment.post.user.id !== req.user?.id
  ) {
    return ResponseHelper.entityNotOwned(res);
  }

  await dbComment.destroy();
  ResponseHelper.entityDeleted(res);
});

module.exports = router;
