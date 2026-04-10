import { Request, Response } from "express";
import { asyncHandler } from "../../shared/utils/asyncHandler";
import { ApiResponse } from "../../shared/utils/apiResponse";
import { AppError } from "../../shared/errors/AppError";
import * as listingService from "./listing.service";
import { MarketplaceFilters } from "./listing.service";

export const uploadPhoto = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new AppError("No file provided", 400, "VALIDATION_ERROR");
  }
  const result = await listingService.uploadPhoto(req.file);
  res.status(201).json(ApiResponse.success(result, "Photo uploaded"));
});

export const createListing = asyncHandler(
  async (req: Request, res: Response) => {
    const listing = await listingService.createListing(req.user!.sub, req.body);
    res.status(201).json(ApiResponse.success(listing, "Listing created"));
  },
);

export const getListing = asyncHandler(async (req: Request, res: Response) => {
  const listing = await listingService.getListing(String(req.params.id));
  res.json(ApiResponse.success(listing, "Listing fetched"));
});

export const getMarketplace = asyncHandler(
  async (req: Request, res: Response) => {
    const filters: MarketplaceFilters = {
      category: req.query.category as never,
      condition: req.query.condition as never,
      minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
      search: req.query.search as string | undefined,
      availableFrom: req.query.availableFrom
        ? new Date(req.query.availableFrom as string)
        : undefined,
      availableTo: req.query.availableTo
        ? new Date(req.query.availableTo as string)
        : undefined,
      trustedCircleOnly: req.query.trustedCircleOnly === "true",
      userId: req.user?.sub,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 12,
    };
    const result = await listingService.getMarketplace(filters);
    res.json(ApiResponse.success(result, "Marketplace fetched"));
  },
);

export const getMyListings = asyncHandler(
  async (req: Request, res: Response) => {
    const listings = await listingService.getMyListings(req.user!.sub);
    res.json(ApiResponse.success(listings, "Your listings fetched"));
  },
);

export const updateListing = asyncHandler(
  async (req: Request, res: Response) => {
    const listing = await listingService.updateListing(
      String(req.params.id),
      req.user!.sub,
      req.body,
    );
    res.json(ApiResponse.success(listing, "Listing updated"));
  },
);

export const deleteListing = asyncHandler(
  async (req: Request, res: Response) => {
    await listingService.deleteListing(String(req.params.id), req.user!.sub);
    res.json(ApiResponse.success(null, "Listing deleted"));
  },
);
