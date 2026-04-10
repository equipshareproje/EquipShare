import { Types } from "mongoose";
import { BookingModel, IBooking } from "./booking.schema";

export const createBooking = (data: Partial<IBooking>) =>
  BookingModel.create(data);

export const findById = (id: string) =>
  BookingModel.findById(id)
    .populate("listingId", "title dailyPrice ownerId")
    .populate("renterId", "name email")
    .populate("ownerId", "name email");

export const findByIdWithSecret = (id: string) =>
  BookingModel.findById(id).select("+stripe.clientSecret");

export const findByRenter = (renterId: string) =>
  BookingModel.find({ renterId: new Types.ObjectId(renterId) })
    .populate("listingId", "title photos dailyPrice")
    .sort({ createdAt: -1 });

export const findByOwner = (ownerId: string) =>
  BookingModel.find({ ownerId: new Types.ObjectId(ownerId) })
    .populate("listingId", "title photos dailyPrice")
    .populate("renterId", "name email rating reviewCount")
    .sort({ createdAt: -1 });

export const updateBooking = (
  id: string,
  data: Partial<IBooking> | Record<string, unknown>,
) => BookingModel.findByIdAndUpdate(id, data, { new: true });

export const hasDateConflict = (
  listingId: string,
  startDate: Date,
  endDate: Date,
  excludeBookingId?: string,
) =>
  BookingModel.findOne({
    listingId: new Types.ObjectId(listingId),
    status: { $in: ["Approved", "Active"] },
    _id: excludeBookingId ? { $ne: excludeBookingId } : undefined,
    $or: [{ startDate: { $lte: endDate }, endDate: { $gte: startDate } }],
  });
