import DbUser from "./DbUser";
import DbTiming from "./sequelize/DbTiming";
import SequelizeObject from "./sequelize/SequelizeObject";
import Comment from "./simple/Comment";

export default interface DbComment
  extends Comment,
    DbTiming,
    SequelizeObject<Comment> {
  id: string;
  user: DbUser;
}
