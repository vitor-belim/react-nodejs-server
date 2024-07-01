import { Request, Response } from "express";
import DbUser from "../types/app/DbUser";
import DbPost from "../types/app/DbPost";

const express = require("express");
const router = express.Router();
const { users: usersTable, posts: postsTable } = require("../models");
const ResponseHelper = require("../helpers/response-helper");

router.get("/:id", async (req: Request, res: Response) => {
  const dbUser: DbUser = await usersTable.findByPk(req.params["id"]);

  if (!dbUser) {
    ResponseHelper.entityNotFound(res);
    return;
  }

  res.json(dbUser);
});

router.get("/:id/posts", async (req: Request, res: Response) => {
  const dbUser: DbUser = await usersTable.findByPk(req.params["id"]);
  if (!dbUser) {
    ResponseHelper.entityNotFound(res);
    return;
  }

  const posts: DbPost[] = await postsTable.findAll({
    where: { userId: req.params["id"] },
  });

  res.json(posts);
});

module.exports = router;
