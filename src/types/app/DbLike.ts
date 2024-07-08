import DbUser from "./DbUser";
import DbTiming from "./sequelize/DbTiming";
import SequelizeObject from "./sequelize/SequelizeObject";
import Like from "./simple/Like";

export default interface DbLike extends Like, DbTiming, SequelizeObject<Like> {
  id: number;
  user: DbUser;
}
