import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";
import sequelizeDb from "../models";
import DbUser from "../types/app/DbUser";

const { users: usersTable } = sequelizeDb;

const requiredTokenResponse = (res: Response) =>
  res.status(401).send({ message: "Access token required" });
const expiredTokenResponse = (res: Response) =>
  res.status(401).send({ message: "Access token expired" });
const invalidTokenResponse = (res: Response) =>
  res.status(401).send({ message: "Invalid access token" });
const invalidJWTResponse = (res: Response, error: Error) =>
  res.status(401).send({ message: "JWT decoding failed", error });

export const validateToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const accessToken: string = <string>req.headers["access-token"];

  if (!accessToken) {
    return requiredTokenResponse(res);
  }

  try {
    let validToken = verify(accessToken, process.env.JWT_SALT || "arandomsalt");
    if (!validToken || typeof validToken === "string" || !validToken["id"]) {
      return invalidTokenResponse(res);
    }

    if (
      !validToken["exp"] ||
      validToken["exp"] < Math.ceil(Date.now() / 1000)
    ) {
      return expiredTokenResponse(res);
    }

    const dbUser: DbUser = await usersTable.findByPk(validToken["id"]);
    if (!dbUser) {
      return invalidTokenResponse(res);
    }

    req.user = dbUser;
    return next();
  } catch (e: any) {
    return invalidJWTResponse(res, e);
  }
};

export const validateOptionalToken = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const accessToken: string = <string>req.headers["access-token"];
    if (accessToken) {
      let validToken = verify(
        accessToken,
        process.env.JWT_SALT || "arandomsalt",
      );
      if (
        typeof validToken !== "string" &&
        validToken &&
        validToken["id"] &&
        validToken["exp"] &&
        validToken["exp"] >= Math.ceil(Date.now() / 1000)
      ) {
        const dbUser: DbUser = await usersTable.findByPk(validToken["id"]);
        if (dbUser) {
          req.user = dbUser;
        }
      }
    }
  } catch (e) {}

  return next();
};
