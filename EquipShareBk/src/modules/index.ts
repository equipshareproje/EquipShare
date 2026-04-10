import { Application } from "express";
import authRouter from "./auth/auth.routes";

export const registerModules = (app: Application): void => {
  app.use("/api/auth", authRouter);
};
