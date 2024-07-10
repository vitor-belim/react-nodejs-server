import bcrypt from "bcrypt";
import express, { Request, Response } from "express";
import { sign } from "jsonwebtoken";
import ResponseHelper from "../helpers/response-helper";
import { validateToken } from "../middleware/auth-mw";
import sequelizeDb from "../models";
import DbUser from "../types/app/db-objects/DbUser";

const router = express.Router();
const { users: usersTable } = sequelizeDb;

interface SimpleUser {
  id: number;
  username: string;
}

interface AuthResponse {
  accessToken: string;
  expiration: Date;
  user: SimpleUser;
}

const signAccessToken = (
  id: number,
  username: string,
  expirationInSeconds: number,
) => {
  return sign({ id, username }, process.env.JWT_SALT || "RandomSalt", {
    expiresIn: expirationInSeconds,
  });
};

const successAuthResponse = (res: Response, message: string, user: DbUser) => {
  const expirationInSeconds = 24 * 60 * 60; // 24 hours
  const expiration = new Date(Date.now() + expirationInSeconds * 1000);

  const simpleUser: SimpleUser = { id: user.id, username: user.username || "" };
  const accessToken = signAccessToken(
    simpleUser.id,
    simpleUser.username,
    expirationInSeconds,
  );

  const authResponse: AuthResponse = {
    accessToken,
    expiration,
    user: simpleUser,
  };

  ResponseHelper.success(res, authResponse, message);
};

const usernameNotAvailableResponse = (res: Response) =>
  ResponseHelper.error(res, "Username is already in use");
const passwordEncryptionFailedResponse = (res: Response, error: Error) =>
  ResponseHelper.error(res, "Password encryption failed", 400, error);
const invalidAuthResponse = (res: Response) =>
  ResponseHelper.error(res, "Invalid username or password");
const invalidPasswordResponse = (res: Response) =>
  ResponseHelper.error(res, "Invalid password");
const unauthorizedResponse = (res: Response) =>
  ResponseHelper.error(res, "Unauthorized", 401);

router.post("/sign-up", async (req: Request, res: Response) => {
  const { username, password } = req.body;

  let dbUser: DbUser = await usersTable.findOne({ where: { username } });
  if (dbUser) {
    usernameNotAvailableResponse(res);
    return;
  }

  await bcrypt
    .hash(password, parseInt(process.env.PASSWORD_SALT || "10"))
    .then(async (hashedPassword: string) => {
      dbUser = await usersTable.create({ username, password: hashedPassword });
      successAuthResponse(res, "User successfully created", dbUser);
    })
    .catch((error: any) => {
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

  const saltRes = await bcrypt.compare(password, dbUser.password || "");
  if (!saltRes) {
    invalidAuthResponse(res);
    return;
  }

  successAuthResponse(res, "Login successful", dbUser);
});

router.get("/refresh", validateToken, async (req: Request, res: Response) => {
  if (!req.user) {
    unauthorizedResponse(res);
    return;
  }

  successAuthResponse(res, "Access token refreshed", req.user);
});

router.post(
  "/update-password",
  validateToken,
  async (req: Request, res: Response) => {
    const { password, newPassword } = req.body;

    let dbUser: DbUser = await usersTable.findByPk(req.user?.id, {
      attributes: { include: ["password"] },
    });

    const saltRes = await bcrypt.compare(password, dbUser.password || "");
    if (!saltRes) {
      invalidPasswordResponse(res);
      return;
    }

    await bcrypt
      .hash(newPassword, parseInt(process.env.PASSWORD_SALT || "10"))
      .then(async (hashedPassword: string) => {
        await dbUser.update({ password: hashedPassword });
        successAuthResponse(res, "Password successfully updated", dbUser);
      })
      .catch((error: any) => {
        passwordEncryptionFailedResponse(res, error);
      });
  },
);

module.exports = router;
