import DbUser from "../app/DbUser";

declare global {
  namespace Express {
    interface Request {
      user?: DbUser;
    }
  }
}
