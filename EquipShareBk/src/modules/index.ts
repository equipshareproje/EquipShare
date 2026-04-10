import { Application } from "express";
import authRouter from "./auth/auth.routes";
import listingRouter from "./listing/listing.routes";
import bookingRouter from "./booking/booking.routes";
import reviewRouter from "./review/review.routes";

export const registerModules = (app: Application): void => {
  app.use("/api/auth", authRouter);
  app.use("/api/listings", listingRouter);
  app.use("/api/bookings", bookingRouter);
  app.use("/api/reviews", reviewRouter);
};
