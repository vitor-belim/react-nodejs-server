import { JwtPayload } from "jsonwebtoken";

const { verify } = require("jsonwebtoken");
const { users: usersTable } = require("../models");

const requiredTokenResponse = (res) =>
  res.status(401).send({ message: "Access token required" });
const expiredTokenResponse = (res) =>
  res.status(401).send({ message: "Access token expired" });
const invalidTokenResponse = (res) =>
  res.status(401).send({ message: "Invalid access token" });
const invalidJWTResponse = (res, error) =>
  res.status(401).send({ message: "JWT decoding failed", error });

class AuthJwt implements JwtPayload {
  id: number;
  username: string;

  // Inherited from JwtPayload
  [key: string]: any;

  aud: string | string[] | undefined;
  exp: number | undefined;
  iat: number | undefined;
  iss: string | undefined;
  jti: string | undefined;
  nbf: number | undefined;
  sub: string | undefined;
}

const validateToken = async (req, res, next) => {
  const accessToken = req.headers["access-token"];

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

    const dbUser = await usersTable.findByPk(validToken.id);
    if (!dbUser) {
      return invalidTokenResponse(res);
    }

    req.user = dbUser;
    return next();
  } catch (e) {
    return invalidJWTResponse(res, e);
  }
};

const validateOptionalToken = async (req, res, next) => {
  try {
    const accessToken = req.headers["access-token"];
    if (accessToken) {
      let validToken = <AuthJwt>verify(accessToken, process.env.JWT_SALT);
      if (
        validToken &&
        validToken.id &&
        validToken.exp &&
        validToken.exp >= Math.ceil(Date.now() / 1000)
      ) {
        const dbUser = await usersTable.findByPk(validToken.id);
        if (dbUser) {
          req.user = dbUser;
        }
      }
    }
  } catch (e) {}

  return next();
};

module.exports = { validateToken, validateOptionalToken };
