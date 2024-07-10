import DbTiming from "../sequelize/DbTiming";
import SequelizeObject from "../sequelize/SequelizeObject";
import DbLike from "./DbLike";
import DbTag from "./DbTag";
import DbUser from "./DbUser";
import Post from "./simple/Post";

export default interface DbPost extends Post, DbTiming, SequelizeObject<Post> {
  id: number;
  user: DbUser;
  likes: DbLike[];
  tags: DbTag[];

  addTags(tag: DbTag): Promise<void>;

  setTags(tags: DbTag[]): Promise<void>;
}
