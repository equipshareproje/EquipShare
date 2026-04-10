import { Router } from "express";
import { authenticate } from "../../shared/middleware/authenticate";
import { validate } from "../../shared/middleware/validate";
import { loginSchema, registerSchema } from "./auth.validation";
import * as controller from "./auth.controller";

const router = Router();

router.post("/register", validate(registerSchema), controller.register);
router.post("/login", validate(loginSchema), controller.login);
router.post("/refresh", controller.refresh);
router.post("/logout", controller.logout);
router.get("/me", authenticate, controller.me);

export default router;
