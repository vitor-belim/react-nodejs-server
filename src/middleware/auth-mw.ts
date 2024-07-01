import { NextFunction, Request, Response } from "express";
import AuthJwt from "../types/app/jsonwebtoken/AuthJwt";
import DbUser from "../types/app/DbUser";

const { verify } = require("jsonwebtoken");
const { users: usersTable } = require("../models");

const requiredTokenResponse = (res: Response) =>
  res.status(401).send({ message: "Access token required" });
const expiredTokenResponse = (res: Response) =>
  res.status(401).send({ message: "Access token expired" });
const invalidTokenResponse = (res: Response) =>
  res.status(401).send({ message: "Invalid access token" });
const invalidJWTResponse = (res: Response, error: Error) =>
  res.status(401).send({ message: "JWT decoding failed", error });

const validateToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const accessToken: string = <string>req.headers["access-token"];

  if (!accessToken) {
    return requiredTokenResponse(res);
  }

  try {
    let validToken = <AuthJwt>verify(accessToken, process.env.JWT_SALT);
    if (!validToken || !validToken.id) {
      return invalidTokenResponse(res);
    }

    if (!validToken.exp || validToken.exp < Math.ceil(Date.now() / 1000)) {
      return expiredTokenResponse(res);
    }

    const dbUser: DbUser = await usersTable.findByPk(validToken.id);
    if (!dbUser) {
      return invalidTokenResponse(res);
    }

    req.user = dbUser;
    return next();
  } catch (e: Error) {
    return invalidJWTResponse(res, e);
  }
};

const validateOptionalToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const accessToken: string = <string>req.headers["access-token"];
    if (accessToken) {
      let validToken = <AuthJwt>verify(accessToken, process.env.JWT_SALT);
      if (
        validToken &&
        validToken.id &&
        validToken.exp &&
        validToken.exp >= Math.ceil(Date.now() / 1000)
      ) {
        const dbUser: DbUser = await usersTable.findByPk(validToken.id);
        if (dbUser) {
          req.user = dbUser;
        }
      }
    }
  } catch (e) {}

  return next();
};

module.exports = { validateToken, validateOptionalToken };
