import { Router } from "express";
import { getDemoBoostIdeasController } from "../controllers/boost.controller";

export const boostRouter = Router();

boostRouter.get("/boost/demo", getDemoBoostIdeasController);
