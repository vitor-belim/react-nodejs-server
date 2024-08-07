import express, { Request, Response } from "express";
import { FindOptions } from "sequelize";
import PaginationHelper from "../helpers/pagination-helper";
import ResponseHelper from "../helpers/response-helper";
import { validateToken } from "../middleware/auth-mw";
import sequelizeDb from "../models";
import DbLike from "../types/app/db-objects/DbLike";
import DbPost from "../types/app/db-objects/DbPost";
import Like from "../types/app/db-objects/simple/Like";

const router = express.Router();
const { likes: likesTable, posts: postsTable } = sequelizeDb;

router.get("/:postId", async (req: Request, res: Response) => {
  const options: FindOptions<Like> = {
    where: { postId: req.params["postId"] },
  };
  const paginatedResponse = await PaginationHelper.getPaginatedResponse(
    req,
    likesTable,
    options,
  );
  ResponseHelper.success(res, paginatedResponse);
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

    const dbLike: DbLike = await likesTable.findByPk(like.id);
    ResponseHelper.success(res, dbLike);
  } else {
    await like.destroy();

    ResponseHelper.success(res, null, "Like removed");
  }
});

module.exports = router;
