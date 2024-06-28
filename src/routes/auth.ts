const express = require("express");
const router = express.Router();
const { users: usersTable } = require("../models");
const bcrypt = require("bcrypt");
const { sign } = require("jsonwebtoken");
const { validateToken } = require("../middleware/auth-mw");

const signAccessToken = (id, username, expirationInSeconds) => {
  return sign({ id, username }, process.env.JWT_SALT, {
    expiresIn: expirationInSeconds,
  });
};
const successAuthResponse = (res, message, user) => {
  const expirationInSeconds = 24 * 60 * 60; // 24 hours
  const expirationDate = new Date(Date.now() + expirationInSeconds * 1000);

  return res.json({
    message,
    user: { id: user.id, username: user.username },
    accessToken: signAccessToken(user.id, user.username, expirationInSeconds),
    expiration: expirationDate,
  });
};

const usernameNotAvailableResponse = (res) =>
  res.status(400).json({ message: "Username is already in use" });
const passwordEncryptionFailedResponse = (res, error) =>
  res.status(400).json({ message: "Password encryption failed", error });
const invalidAuthResponse = (res) =>
  res.status(400).json({ message: "Invalid username or password" });
const invalidPasswordResponse = (res) =>
  res.status(400).json({ message: "Invalid password" });

router.post("/sign-up", async (req, res) => {
  const { username, password } = req.body;

  let dbUser = await usersTable.findOne({ where: { username } });
  if (dbUser) {
    return usernameNotAvailableResponse(res);
  }

  await bcrypt
    .hash(password, parseInt(process.env.PASSWORD_SALT))
    .then(async (hashedPassword) => {
      dbUser = await usersTable.create({ username, password: hashedPassword });
      successAuthResponse(res, "User successfully created", dbUser);
    })
    .catch((error) => {
      passwordEncryptionFailedResponse(res, error);
    });
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  let dbUser = await usersTable.findOne({
    where: { username },
    attributes: { include: ["password"] },
  });
  if (!dbUser) {
    return invalidAuthResponse(res);
  }

  const saltRes = await bcrypt.compare(password, dbUser.password);
  if (!saltRes) {
    return invalidAuthResponse(res);
  }

  successAuthResponse(res, "Login successful", dbUser);
});

router.get("/refresh", validateToken, async (req, res) => {
  successAuthResponse(res, "Access token refreshed", req.user);
});

router.post("/update-password", validateToken, async (req, res) => {
  const { password, newPassword } = req.body;

  let dbUser = await usersTable.findByPk(req.user?.id, {
    attributes: { include: ["password"] },
  });

  const saltRes = await bcrypt.compare(password, dbUser.password);
  if (!saltRes) {
    return invalidPasswordResponse(res);
  }

  await bcrypt
    .hash(newPassword, parseInt(process.env.PASSWORD_SALT))
    .then(async (hashedPassword) => {
      await dbUser.update({ password: hashedPassword });
      successAuthResponse(res, "Password successfully updated", dbUser);
    })
    .catch((error) => {
      passwordEncryptionFailedResponse(res, error);
    });
});

module.exports = router;
