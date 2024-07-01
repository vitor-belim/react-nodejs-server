import { Request, Response } from "express";
import DbUser from "../types/app/DbUser";

const express = require("express");
const router = express.Router();
const { users: usersTable } = require("../models");
const bcrypt = require("bcrypt");
const { sign } = require("jsonwebtoken");
const { validateToken } = require("../middleware/auth-mw");

const signAccessToken = (
  id: number,
  username: string,
  expirationInSeconds: number,
) => {
  return sign({ id, username }, process.env.JWT_SALT, {
    expiresIn: expirationInSeconds,
  });
};
const successAuthResponse = (res: Response, message: string, user: DbUser) => {
  const expirationInSeconds = 24 * 60 * 60; // 24 hours
  const expirationDate = new Date(Date.now() + expirationInSeconds * 1000);

  return res.json({
    message,
    user: { id: user.id, username: user.username },
    accessToken: signAccessToken(
      user.id,
      <string>user.username,
      expirationInSeconds,
    ),
    expiration: expirationDate,
  });
};

const usernameNotAvailableResponse = (res: Response) =>
  res.status(400).json({ message: "Username is already in use" });
const passwordEncryptionFailedResponse = (res: Response, error: Error) =>
  res.status(400).json({ message: "Password encryption failed", error });
const invalidAuthResponse = (res: Response) =>
  res.status(400).json({ message: "Invalid username or password" });
const invalidPasswordResponse = (res: Response) =>
  res.status(400).json({ message: "Invalid password" });

router.post("/sign-up", async (req: Request, res: Response) => {
  const { username, password } = req.body;

  let dbUser: DbUser = await usersTable.findOne({ where: { username } });
  if (dbUser) {
    usernameNotAvailableResponse(res);
    return;
  }

  await bcrypt
    .hash(password, parseInt(process.env.PASSWORD_SALT))
    .then(async (hashedPassword: string) => {
      dbUser = await usersTable.create({ username, password: hashedPassword });
      successAuthResponse(res, "User successfully created", dbUser);
    })
    .catch((error: Error) => {
      passwordEncryptionFailedResponse(res, error);
    });
});

router.post("/login", async (req: Request, res: Response) => {
  const { username, password } = req.body;

  let dbUser: DbUser = await usersTable.findOne({
    where: { username },
    attributes: { include: ["password"] },
  });
  if (!dbUser) {
    invalidAuthResponse(res);
    return;
  }

  const saltRes = await bcrypt.compare(password, dbUser.password);
  if (!saltRes) {
    invalidAuthResponse(res);
    return;
  }

  successAuthResponse(res, "Login successful", dbUser);
});

router.get("/refresh", validateToken, async (req: Request, res: Response) => {
  successAuthResponse(res, "Access token refreshed", <DbUser>req.user);
});

router.post(
  "/update-password",
  validateToken,
  async (req: Request, res: Response) => {
    const { password, newPassword } = req.body;

    let dbUser: DbUser = await usersTable.findByPk(req.user?.id, {
      attributes: { include: ["password"] },
    });

    const saltRes = await bcrypt.compare(password, dbUser.password);
    if (!saltRes) {
      invalidPasswordResponse(res);
      return;
    }

    await bcrypt
      .hash(newPassword, parseInt(process.env.PASSWORD_SALT))
      .then(async (hashedPassword: string) => {
        await dbUser.update({ password: hashedPassword });
        successAuthResponse(res, "Password successfully updated", dbUser);
      })
      .catch((error: Error) => {
        passwordEncryptionFailedResponse(res, error);
      });
  },
);

module.exports = router;
