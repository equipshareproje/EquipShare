import { Router } from "express";
import multer from "multer";
import { authenticate } from "../../shared/middleware/authenticate";
import { validate } from "../../shared/middleware/validate";
import * as bookingController from "./booking.controller";
import { createBookingSchema, rejectBookingSchema } from "./booking.validation";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

// GET /api/bookings/my/renting
router.get("/my/renting", authenticate, bookingController.getMyRentingBookings);

// GET /api/bookings/my/lending
router.get("/my/lending", authenticate, bookingController.getMyLendingBookings);

// POST /api/bookings
router.post(
  "/",
  authenticate,
  validate(createBookingSchema.shape.body as never),
  bookingController.createBooking,
);

// GET /api/bookings/:id
router.get("/:id", authenticate, bookingController.getBooking);

// POST /api/bookings/:id/approve
router.post("/:id/approve", authenticate, bookingController.approveBooking);

// POST /api/bookings/:id/reject
router.post(
  "/:id/reject",
  authenticate,
  validate(rejectBookingSchema.shape.body as never),
  bookingController.rejectBooking,
);

// POST /api/bookings/:id/handover/pre-rental  (lender, min 3 photos)
router.post(
  "/:id/handover/pre-rental",
  authenticate,
  upload.array("photos", 20),
  bookingController.uploadPreRentalPhotos,
);

// POST /api/bookings/:id/handover/received  (renter)
router.post(
  "/:id/handover/received",
  authenticate,
  upload.array("photos", 20),
  bookingController.uploadReceivedPhotos,
);

export default router;
