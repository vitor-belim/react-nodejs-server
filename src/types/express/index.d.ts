import DbUser from "../app/db-objects/DbUser";

// This file adds the "user" field to the Request class from Express

declare global {
  namespace Express {
    // noinspection JSUnusedGlobalSymbols
    interface Request {
      user?: DbUser;
    }
  }
}
