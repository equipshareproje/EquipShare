import { Request, Response } from "express";
import { asyncHandler } from "../../shared/utils/asyncHandler";
import { ApiResponse } from "../../shared/utils/apiResponse";
import * as bookingService from "./booking.service";

export const createBooking = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await bookingService.createBooking(req.user!.sub, req.body);
    res
      .status(201)
      .json(
        ApiResponse.success(
          result,
          "Booking created. Complete payment using the clientSecret.",
        ),
      );
  },
);

export const getBooking = asyncHandler(async (req: Request, res: Response) => {
  const booking = await bookingService.getBooking(
    String(req.params.id),
    req.user!.sub,
  );
  res.json(ApiResponse.success(booking, "Booking fetched"));
});

export const getMyRentingBookings = asyncHandler(
  async (req: Request, res: Response) => {
    const bookings = await bookingService.getMyRentingBookings(req.user!.sub);
    res.json(ApiResponse.success(bookings, "Your renting bookings"));
  },
);

export const getMyLendingBookings = asyncHandler(
  async (req: Request, res: Response) => {
    const bookings = await bookingService.getMyLendingBookings(req.user!.sub);
    res.json(ApiResponse.success(bookings, "Your lending bookings"));
  },
);

export const approveBooking = asyncHandler(
  async (req: Request, res: Response) => {
    await bookingService.approveBooking(String(req.params.id), req.user!.sub);
    res.json(ApiResponse.success(null, "Booking approved. Payment captured."));
  },
);

export const rejectBooking = asyncHandler(
  async (req: Request, res: Response) => {
    await bookingService.rejectBooking(
      String(req.params.id),
      req.user!.sub,
      req.body.reason,
    );
    res.json(
      ApiResponse.success(null, "Booking rejected. Payment hold released."),
    );
  },
);

export const uploadPreRentalPhotos = asyncHandler(
  async (req: Request, res: Response) => {
    const files = req.files as Express.Multer.File[];
    const result = await bookingService.uploadPreRentalPhotos(
      String(req.params.id),
      req.user!.sub,
      files,
    );
    res.json(
      ApiResponse.success(
        result,
        "Pre-rental photos uploaded. Renter notified.",
      ),
    );
  },
);

export const uploadReceivedPhotos = asyncHandler(
  async (req: Request, res: Response) => {
    const files = req.files as Express.Multer.File[];
    const result = await bookingService.uploadReceivedPhotos(
      String(req.params.id),
      req.user!.sub,
      files,
    );
    res.json(
      ApiResponse.success(
        result,
        "Received photos uploaded. Booking is now Active.",
      ),
    );
  },
);
