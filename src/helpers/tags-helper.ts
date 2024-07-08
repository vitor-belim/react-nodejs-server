import sequelizeDb from "../models";
import DbPost from "../types/app/DbPost";
import Tag from "../types/app/simple/Tag";

const { tags: tagsTable } = sequelizeDb;

export default class TagsHelper {
  static async associate(post: DbPost, tags: Tag[]) {
    if (!tags) {
      return;
    }

    // clear associated tags
    await post.setTags([]);

    for (const tag of tags) {
      // find existing tag, or create new one
      const [dbTag, _created] = await tagsTable.findOrCreate({
        where: { name: tag.name },
        defaults: { name: tag.name },
      });

      // associate tag
      await post.addTags(dbTag);
    }
  }
}
