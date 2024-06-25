const express = require("express");
const router = express.Router();
const { posts: postsTable } = require("../models");
const { validateToken } = require("../middleware/auth-mw");
const ResponseHelper = require("../helpers/response-helper");
let TagsHelper = require("../helpers/tags-helper");

router.get("/", async (req, res) => {
  res.json(await postsTable.findAll({ order: [["id", "DESC"]] }));
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

  if (req.body.tags) {
    await TagsHelper.associate(dbPost, req.body.tags);
  }

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
