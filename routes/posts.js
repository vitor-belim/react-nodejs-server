const express = require("express");
const router = express.Router();
const { posts: postsTable } = require("../models");
const { validateToken } = require("../middleware/auth-mw");
const PostsSearchHelper = require("../helpers/posts-search-helper");
const TagsHelper = require("../helpers/tags-helper");
const ResponseHelper = require("../helpers/response-helper");

router.get("/", async (req, res) => {
  const options = PostsSearchHelper.getQueryOptions(req);

  res.json(await postsTable.findAll(options));
});

router.post("/", validateToken, async (req, res) => {
  let newPost = await postsTable.create({ ...req.body, userId: req.user.id });

  await TagsHelper.associate(newPost, req.body.tags);

  res.json(await postsTable.findByPk(newPost.id));
});

router.get("/:id", async (req, res) => {
  const dbPost = await postsTable.findByPk(req.params.id);

  if (!dbPost) {
    return ResponseHelper.entityNotFound(res);
  }

  res.json(dbPost);
});

router.put("/:id", validateToken, async (req, res) => {
  let dbPost = await postsTable.findByPk(req.params.id);

  if (!dbPost) {
    return ResponseHelper.entityNotFound(res);
  }
  if (dbPost.user.id !== req.user.id) {
    return ResponseHelper.entityNotOwned(res);
  }

  await TagsHelper.associate(dbPost, req.body.tags);

  await dbPost.update(req.body);

  res.json(await postsTable.findByPk(req.params.id));
});

router.delete("/:id", validateToken, async (req, res) => {
  const dbPost = await postsTable.findByPk(req.params.id);

  if (!dbPost) {
    return ResponseHelper.entityNotFound(res);
  }
  if (dbPost.user.id !== req.user.id) {
    return ResponseHelper.entityNotOwned(res);
  }

  await dbPost.setTags([]);

  await dbPost.destroy();
  ResponseHelper.entityDeleted(res);
});

module.exports = router;
