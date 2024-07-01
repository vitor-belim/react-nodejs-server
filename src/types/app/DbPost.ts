import Post from "./simple/Post";
import DbTiming from "./sequelize/DbTiming";
import DbTag from "./DbTag";
import DbUser from "./DbUser";
import SequelizeObject from "./sequelize/SequelizeObject";

export default interface DbPost extends Post, DbTiming, SequelizeObject<Post> {
  id: number;
  userId: number;

  addTags(tag: DbTag): Promise<void>;

  setTags(tags: DbTag[]): Promise<void>;

  tags?: DbTag[];
  user: DbUser;

  update(post: Post): Promise<void>;
}
