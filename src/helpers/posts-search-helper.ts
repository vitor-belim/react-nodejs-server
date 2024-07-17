import { Request } from "express";
import { FindOptions, Op } from "sequelize";
import sequelizeDb from "../models";
import Post from "../types/app/db-objects/simple/Post";

const { tags: tagsTable, posts: postsTable } = sequelizeDb;

class PostsSearchHelper {
  static tagsFilterTablesInitialized = 0;

  initTagFilterTable(index: number) {
    if (PostsSearchHelper.tagsFilterTablesInitialized > index) {
      return;
    }

    postsTable.belongsToMany(tagsTable, {
      through: "post-tags",
      as: "tags-filter-table-" + index,
    });
    PostsSearchHelper.tagsFilterTablesInitialized++;
  }

  getQueryOptions(req: Request, options: FindOptions<Post> = {}) {
    if (!req.query) {
      return options;
    }

    if (req.query["query"]) {
      options.where = {
        [Op.or]: {
          title: {
            [Op.like]: `%${req.query["query"]}%`,
          },
          postText: {
            [Op.like]: `%${req.query["query"]}%`,
          },
        },
      };
    }

    if (req.query["tags"]) {
      const tags = req.query["tags"] as string[];

      options.include = [];

      for (let i = 0; i < tags.length; i++) {
        const tag = tags[i];
        if (tag) {
          this.initTagFilterTable(i);

          options.include.push({
            model: tagsTable,
            as: "tags-filter-table-" + i,
            through: {
              attributes: [],
            },
            where: {
              name: tag,
            },
            attributes: [],
          });
        }
      }
    }

    return options;
  }
}

const postsSearchHelper = new PostsSearchHelper();
export default postsSearchHelper;
