import { Types } from "mongoose";
import { BookingModel } from "../booking/booking.schema";
import { IPayoutRequest, PayoutModel } from "./earnings.schema";
import { PaginationMeta } from "../../shared/types/pagination";

export interface TransactionRow {
  bookingId: string;
  listingTitle: string;
  renterName: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  dailyPrice: number;
  subtotal: number;
  serviceFee: number;
  totalAmount: number;
  completedAt: string;
}

export interface TransactionFilters {
  startDate?: Date;
  endDate?: Date;
  listingId?: string;
  page: number;
  limit: number;
}

// ── Booking queries ────────────────────────────────────────────────────────

export const sumCompletedEarnings = async (
  lenderId: string,
): Promise<number> => {
  const result = await BookingModel.aggregate([
    {
      $match: {
        ownerId: new Types.ObjectId(lenderId),
        status: "Completed",
      },
    },
    { $group: { _id: null, total: { $sum: "$totalAmount" } } },
  ]);
  return result[0]?.total ?? 0;
};

export const getMonthlyBreakdown = async (
  lenderId: string,
): Promise<{ month: string; amount: number }[]> => {
  const result = await BookingModel.aggregate([
    {
      $match: {
        ownerId: new Types.ObjectId(lenderId),
        status: "Completed",
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$updatedAt" },
          month: { $month: "$updatedAt" },
        },
        amount: { $sum: "$totalAmount" },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);
  return result.map((r) => ({
    month: `${r._id.year}-${String(r._id.month).padStart(2, "0")}`,
    amount: r.amount,
  }));
};

export const getTransactions = async (
  lenderId: string,
  filters: TransactionFilters,
): Promise<{ transactions: TransactionRow[]; meta: PaginationMeta }> => {
  const match: Record<string, unknown> = {
    ownerId: new Types.ObjectId(lenderId),
    status: "Completed",
  };

  if (filters.startDate || filters.endDate) {
    const dateFilter: Record<string, Date> = {};
    if (filters.startDate) dateFilter.$gte = filters.startDate;
    if (filters.endDate) dateFilter.$lte = filters.endDate;
    match.updatedAt = dateFilter;
  }

  if (filters.listingId) {
    match.listingId = new Types.ObjectId(filters.listingId);
  }

  const skip = (filters.page - 1) * filters.limit;
  const [raw, total] = await Promise.all([
    BookingModel.find(match)
      .populate<{ listingId: { title: string } }>("listingId", "title")
      .populate<{ renterId: { name: string } }>("renterId", "name")
      .sort({ _id: -1 })
      .skip(skip)
      .limit(filters.limit)
      .lean(),
    BookingModel.countDocuments(match),
  ]);

  const transactions: TransactionRow[] = raw.map((b) => ({
    bookingId: String(b._id),
    listingTitle:
      typeof b.listingId === "object" && b.listingId !== null
        ? (b.listingId as { title: string }).title
        : String(b.listingId),
    renterName:
      typeof b.renterId === "object" && b.renterId !== null
        ? (b.renterId as { name: string }).name
        : String(b.renterId),
    startDate: b.startDate.toISOString(),
    endDate: b.endDate.toISOString(),
    totalDays: b.totalDays,
    dailyPrice: b.dailyPrice,
    subtotal: b.subtotal,
    serviceFee: b.serviceFee,
    totalAmount: b.totalAmount,
    completedAt: b.updatedAt.toISOString(),
  }));

  return {
    transactions,
    meta: {
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages: Math.ceil(total / filters.limit),
    },
  };
};

// ── Payout queries ─────────────────────────────────────────────────────────

export const sumPaidPayouts = async (lenderId: string): Promise<number> => {
  const result = await PayoutModel.aggregate([
    {
      $match: {
        lenderId: new Types.ObjectId(lenderId),
        status: { $in: ["Paid", "Processing"] },
      },
    },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  return result[0]?.total ?? 0;
};

export const findActivePayout = (lenderId: string) =>
  PayoutModel.findOne({
    lenderId: new Types.ObjectId(lenderId),
    status: { $in: ["Pending", "Processing"] },
  });

export const createPayout = (data: {
  lenderId: string;
  amount: number;
}): Promise<IPayoutRequest> =>
  PayoutModel.create({
    lenderId: new Types.ObjectId(data.lenderId),
    amount: data.amount,
  });

export const findPayoutsByLender = (lenderId: string) =>
  PayoutModel.find({ lenderId: new Types.ObjectId(lenderId) }).sort({
    _id: -1,
  });
