import DbTiming from "./sequelize/DbTiming";
import SequelizeObject from "./sequelize/SequelizeObject";
import User from "./simple/User";

export default interface DbUser extends User, DbTiming, SequelizeObject<User> {
  id: number;
}
