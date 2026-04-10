import { AppError } from "../../shared/errors/AppError";
import { storageService } from "../../shared/services/storage";
import * as listingRepository from "./listing.repository";
import { ListingFilters } from "./listing.repository";
import { ListingCategory, ListingCondition } from "./listing.schema";
import { UserModel } from "../auth/auth.schema";

export interface CreateListingDto {
  title: string;
  category: ListingCategory;
  description: string;
  specifications?: string;
  condition: ListingCondition;
  dailyPrice: number;
  photos: string[];
  blockedDates?: string[];
}

export interface UpdateListingDto {
  title?: string;
  category?: ListingCategory;
  description?: string;
  specifications?: string;
  condition?: ListingCondition;
  dailyPrice?: number;
  photos?: string[];
  blockedDates?: string[];
  status?: "Active" | "Inactive";
}

export const uploadPhoto = async (
  file: Express.Multer.File,
): Promise<{ url: string }> => {
  const url = await storageService.uploadFile({
    buffer: file.buffer,
    originalName: file.originalname,
    mimeType: file.mimetype,
    folder: "listings",
  });
  return { url };
};

export const createListing = async (ownerId: string, dto: CreateListingDto) => {
  const listing = await listingRepository.createListing({
    ownerId: ownerId as never,
    ...dto,
    blockedDates: dto.blockedDates?.map((d) => new Date(d)) ?? [],
    status: "Active",
  });

  // Auto-promote owner to Lender role on their first listing
  await UserModel.findByIdAndUpdate(ownerId, {
    $addToSet: { roles: "Lender" },
  });

  return listing;
};

export const getListing = async (id: string) => {
  const listing = await listingRepository.findById(id);
  if (!listing || listing.status === "Deleted") {
    throw new AppError("Listing not found", 404, "NOT_FOUND");
  }
  return listing;
};

export interface MarketplaceFilters extends Omit<ListingFilters, "ownerIds"> {
  availableFrom?: Date;
  availableTo?: Date;
  trustedCircleOnly?: boolean;
  userId?: string;
}

export const getMarketplace = async (filters: MarketplaceFilters) => {
  const repoFilters: ListingFilters = {
    category: filters.category,
    condition: filters.condition,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    search: filters.search,
    availableFrom: filters.availableFrom,
    availableTo: filters.availableTo,
    page: filters.page,
    limit: filters.limit,
  };

  if (filters.trustedCircleOnly && filters.userId) {
    const currentUser = await UserModel.findById(filters.userId).lean();
    if (currentUser && currentUser.trustedCircle.length > 0) {
      const members = await UserModel.find({
        trustedCircle: { $elemMatch: { $in: currentUser.trustedCircle } },
        _id: { $ne: currentUser._id },
      })
        .select("_id")
        .lean();
      repoFilters.ownerIds = members.map((m) => String(m._id));
      // If no circle members found return empty result early
      if (repoFilters.ownerIds.length === 0) {
        return {
          listings: [],
          meta: {
            total: 0,
            page: filters.page,
            limit: filters.limit,
            totalPages: 0,
          },
        };
      }
    }
  }

  return listingRepository.findMarketplace(repoFilters);
};

export const getMyListings = async (ownerId: string) =>
  listingRepository.findByOwner(ownerId);

export const updateListing = async (
  id: string,
  ownerId: string,
  dto: UpdateListingDto,
) => {
  const listing = await listingRepository.findByIdAndOwner(id, ownerId);
  if (!listing) {
    throw new AppError("Listing not found or not yours", 404, "NOT_FOUND");
  }

  const updated = await listingRepository.updateListing(id, {
    ...dto,
    blockedDates: dto.blockedDates?.map((d) => new Date(d)),
  } as never);
  return updated;
};

export const deleteListing = async (id: string, ownerId: string) => {
  const listing = await listingRepository.findByIdAndOwner(id, ownerId);
  if (!listing) {
    throw new AppError("Listing not found or not yours", 404, "NOT_FOUND");
  }
  await listingRepository.softDelete(id);
};
