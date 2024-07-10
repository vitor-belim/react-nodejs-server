import { Request } from "express";
import { FindOptions, Op } from "sequelize";
import sequelizeDb from "../models";
import Post from "../types/app/db-objects/simple/Post";

const { tags: tagsTable } = sequelizeDb;

export default class PostsSearchHelper {
  static getQueryOptions(req: Request, options: FindOptions<Post> = {}) {
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

    if (req.query["tag"]) {
      options.include = [
        {
          model: tagsTable,
          as: "tags-filter-table",
          through: {
            attributes: [],
          },
          where: {
            name: req.query["tag"],
          },
          attributes: [],
        },
      ];
    }

    return options;
  }
}
