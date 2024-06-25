const { tags: tagsTable } = require("../models");

class TagsHelper {
  async associate(post, tags) {
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

let instance = new TagsHelper();

module.exports = instance;
