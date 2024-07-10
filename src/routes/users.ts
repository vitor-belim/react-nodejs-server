import express, { Request, Response } from "express";
import ResponseHelper from "../helpers/response-helper";
import sequelizeDb from "../models";
import DbUser from "../types/app/db-objects/DbUser";

const router = express.Router();
const { users: usersTable } = sequelizeDb;

router.get("/:id", async (req: Request, res: Response) => {
  const dbUser: DbUser = await usersTable.findByPk(req.params["id"]);

  if (!dbUser) {
    ResponseHelper.entityNotFound(res);
    return;
  }

  ResponseHelper.success(res, dbUser);
});

module.exports = router;
