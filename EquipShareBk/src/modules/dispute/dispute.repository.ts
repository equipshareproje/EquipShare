import { DisputeModel, IDispute } from "./dispute.schema";

export const createDispute = (data: Partial<IDispute>) =>
  DisputeModel.create(data);

export const findById = (id: string) =>
  DisputeModel.findById(id)
    .populate(
      "bookingId",
      "listingId startDate endDate totalAmount status handover",
    )
    .populate("filedById", "name email")
    .populate("resolvedById", "name email");

export const findByFilerId = (userId: string) =>
  DisputeModel.find({ filedById: userId })
    .populate("bookingId", "listingId startDate endDate status")
    .sort({ createdAt: -1 });

export const findInvolvedDisputes = (userId: string) =>
  DisputeModel.find({ $or: [{ filedById: userId }] })
    .populate(
      "bookingId",
      "listingId startDate endDate status renterId ownerId",
    )
    .sort({ createdAt: -1 });

export const findAll = (filter: { status?: string } = {}) => {
  const query: Record<string, unknown> = {};
  if (filter.status) query.status = filter.status;
  return DisputeModel.find(query)
    .populate("bookingId", "listingId startDate endDate totalAmount")
    .populate("filedById", "name email")
    .sort({ createdAt: -1 });
};

export const findOpenByBooking = (bookingId: string) =>
  DisputeModel.findOne({
    bookingId,
    status: { $in: ["Open", "UnderReview"] },
  });

export const updateDispute = (
  id: string,
  data: Partial<IDispute> | Record<string, unknown>,
) => DisputeModel.findByIdAndUpdate(id, data, { new: true });
