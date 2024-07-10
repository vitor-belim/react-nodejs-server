import DbTiming from "../sequelize/DbTiming";
import SequelizeObject from "../sequelize/SequelizeObject";
import Tag from "./simple/Tag";

export default interface DbTag extends Tag, DbTiming, SequelizeObject<Tag> {
  id: string;
}
