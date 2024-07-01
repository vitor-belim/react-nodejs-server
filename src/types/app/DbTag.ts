import Tag from "./simple/Tag";
import DbTiming from "./sequelize/DbTiming";
import SequelizeObject from "./sequelize/SequelizeObject";

export default interface DbTag extends Tag, DbTiming, SequelizeObject<Tag> {
  id: string;
}
