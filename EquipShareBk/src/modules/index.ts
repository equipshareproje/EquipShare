import { Application } from "express";
import authRouter from "./auth/auth.routes";
import listingRouter from "./listing/listing.routes";
import bookingRouter from "./booking/booking.routes";
import reviewRouter from "./review/review.routes";
import disputeRouter from "./dispute/dispute.routes";
import reportRouter from "./report/report.routes";
import earningsRouter from "./earnings/earnings.routes";
import circleRouter from "./circle/circle.routes";

export const registerModules = (app: Application): void => {
  app.use("/api/auth", authRouter);
  app.use("/api/listings", listingRouter);
  app.use("/api/bookings", bookingRouter);
  app.use("/api/reviews", reviewRouter);
  app.use("/api/disputes", disputeRouter);
  app.use("/api/reports", reportRouter);
  app.use("/api/earnings", earningsRouter);
  app.use("/api/circles", circleRouter);
};
