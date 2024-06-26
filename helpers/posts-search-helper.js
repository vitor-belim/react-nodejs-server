const { Op } = require("sequelize");
const { tags: tagsTable } = require("../models");

class PostsSearchHelper {
  getQueryOptions(req, options = {}) {
    if (!req.query) {
      return options;
    }

    if (req.query.query) {
      options.where = {
        [Op.or]: {
          title: {
            [Op.like]: `%${req.query.query}%`,
          },
          postText: {
            [Op.like]: `%${req.query.query}%`,
          },
        },
      };
    }

    if (req.query.tag) {
      options.include = [
        {
          model: tagsTable,
          as: "tags-filter-table",
          through: {
            attributes: [],
          },
          where: {
            name: req.query.tag,
          },
          attributes: [],
        },
      ];
    }

    return options;
  }
}

let instance = new PostsSearchHelper();

module.exports = instance;
