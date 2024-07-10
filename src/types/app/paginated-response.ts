export default interface PaginatedResponse<T> {
  total: number;
  limit: number;
  page: number;
  pages: number;
  items: T[];
}
