import { PaginationMeta } from "../types/pagination";

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export const parsePagination = (query: {
  page?: string;
  limit?: string;
}): PaginationOptions => {
  const page = Math.max(1, parseInt(query.page ?? "1", 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, parseInt(query.limit ?? "20", 10) || 20),
  );
  return { page, limit };
};

export const buildPaginationMeta = (
  total: number,
  page: number,
  limit: number,
): PaginationMeta => ({
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
});
