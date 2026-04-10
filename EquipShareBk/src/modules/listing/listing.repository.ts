import { Types } from "mongoose";
import {
  IListing,
  ListingCategory,
  ListingCondition,
  ListingModel,
} from "./listing.schema";
import { PaginationMeta } from "../../shared/types/pagination";

export interface ListingFilters {
  category?: ListingCategory;
  condition?: ListingCondition;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  availableFrom?: Date;
  availableTo?: Date;
  ownerIds?: string[]; // used for trustedCircleOnly filter
  page: number;
  limit: number;
}

export const createListing = (data: Partial<IListing>) =>
  ListingModel.create(data);

export const findById = (id: string) => ListingModel.findById(id);

export const findByIdAndOwner = (id: string, ownerId: string) =>
  ListingModel.findOne({
    _id: id,
    ownerId: new Types.ObjectId(ownerId),
    status: { $ne: "Deleted" },
  });

export const updateListing = (id: string, data: Partial<IListing>) =>
  ListingModel.findByIdAndUpdate(id, data, { new: true });

export const softDelete = (id: string) =>
  ListingModel.findByIdAndUpdate(id, { status: "Deleted" }, { new: true });

export const findByOwner = (ownerId: string) =>
  ListingModel.find({
    ownerId: new Types.ObjectId(ownerId),
    status: { $ne: "Deleted" },
  }).sort({ createdAt: -1 });

export const findMarketplace = async (
  filters: ListingFilters,
): Promise<{ listings: IListing[]; meta: PaginationMeta }> => {
  const query: Record<string, unknown> = { status: "Active" };

  if (filters.category) query.category = filters.category;
  if (filters.condition) query.condition = filters.condition;
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    query.dailyPrice = {};
    if (filters.minPrice !== undefined)
      (query.dailyPrice as Record<string, number>).$gte = filters.minPrice;
    if (filters.maxPrice !== undefined)
      (query.dailyPrice as Record<string, number>).$lte = filters.maxPrice;
  }
  if (filters.search) {
    query.$text = { $search: filters.search };
  }
  if (filters.availableFrom && filters.availableTo) {
    // Exclude listings that have any blocked date within the requested range
    const dates: Date[] = [];
    const cursor = new Date(filters.availableFrom);
    const end = new Date(filters.availableTo);
    while (cursor <= end) {
      dates.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    query.blockedDates = { $not: { $elemMatch: { $in: dates } } };
  }
  if (filters.ownerIds && filters.ownerIds.length > 0) {
    query.ownerId = {
      $in: filters.ownerIds.map((id) => new Types.ObjectId(id)),
    };
  }

  const skip = (filters.page - 1) * filters.limit;
  const [listings, total] = await Promise.all([
    ListingModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(filters.limit),
    ListingModel.countDocuments(query),
  ]);

  return {
    listings,
    meta: {
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages: Math.ceil(total / filters.limit),
    },
  };
};
