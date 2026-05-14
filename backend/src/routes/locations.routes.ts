import { Router } from "express";
import { getDemoLocationsController } from "../controllers/locations.controller";

export const locationsRouter = Router();

locationsRouter.get("/locations/demo", getDemoLocationsController);
