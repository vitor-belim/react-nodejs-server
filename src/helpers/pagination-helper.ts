import { Request } from "express";
import { FindOptions } from "sequelize";
import PaginatedResponse from "../types/app/paginated-response";

class PaginationHelper {
  async getPaginatedResponse<T>(
    req: Request,
    table: any,
    options: FindOptions<T> = {},
  ): Promise<PaginatedResponse<T>> {
    const page = parseInt(req.query.page as string) || 0;
    const limit = parseInt(req.query.limit as string) || 5;

    const items: T[] = await table.findAll(<FindOptions<T>>{
      ...options,
      offset: page * limit,
      limit: limit,
    });

    const unscopedPostsTable = table.unscoped();
    const total: number = await unscopedPostsTable.count(options);
    const pages: number = Math.ceil(total / limit);

    return <PaginatedResponse<T>>{
      total,
      limit,
      page,
      pages,
      items,
    };
  }
}

const paginationHelper = new PaginationHelper();
export default paginationHelper;
