import Like from "./simple/Like";
import SequelizeObject from "./sequelize/SequelizeObject";
import DbTiming from "./sequelize/DbTiming";

export default interface DbLike extends Like, DbTiming, SequelizeObject<Like> {
  id: number;
}
