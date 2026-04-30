import { Router } from "express";
import { authenticate } from "../../shared/middleware/authenticate";
import { validate } from "../../shared/middleware/validate";
import {
  loginSchema,
  registerSchema,
  resendVerificationSchema,
} from "./auth.validation";
import * as controller from "./auth.controller";

const router = Router();

router.post("/register", validate(registerSchema), controller.register);

router.post("/login", validate(loginSchema), controller.login);

router.post("/refresh", controller.refresh);

router.post("/logout", controller.logout);

router.get("/me", authenticate, controller.me);

router.get("/verify-email", controller.verifyEmail);

router.post(
  "/resend-verification",
  validate(resendVerificationSchema),
  controller.resendVerification,
);

export default router;
