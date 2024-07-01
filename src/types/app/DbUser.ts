import User from "./simple/User";
import DbTiming from "./sequelize/DbTiming";
import SequelizeObject from "./sequelize/SequelizeObject";

export default interface DbUser extends User, DbTiming, SequelizeObject<User> {
  id: number;
}
