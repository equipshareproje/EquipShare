import { Router } from "express";
import multer from "multer";
import { authenticate } from "../../shared/middleware/authenticate";
import { optionalAuthenticate } from "../../shared/middleware/optionalAuthenticate";
import { validate } from "../../shared/middleware/validate";
import * as listingController from "./listing.controller";
import { createListingSchema, updateListingSchema } from "./listing.validation";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// Photo upload — authenticated, single file
router.post(
  "/upload-photo",
  authenticate,
  upload.single("photo"),
  listingController.uploadPhoto,
);

// Marketplace browse — public, but token used if present for trustedCircleOnly
router.get("/", optionalAuthenticate, listingController.getMarketplace);

// My listings — authenticated
router.get("/my", authenticate, listingController.getMyListings);

// Create listing — authenticated
router.post(
  "/",
  authenticate,
  validate(createListingSchema),
  listingController.createListing,
);

// Single listing — public
router.get("/:id", listingController.getListing);

// Update listing — owner only
router.put(
  "/:id",
  authenticate,
  validate(updateListingSchema),
  listingController.updateListing,
);

// Delete listing — owner only
router.delete("/:id", authenticate, listingController.deleteListing);

export default router;
