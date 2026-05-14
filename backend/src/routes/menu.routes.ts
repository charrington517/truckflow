import { Router } from "express";
import { getDemoMenuOpportunitiesController } from "../controllers/menu.controller";

export const menuRouter = Router();

menuRouter.get("/menu/opportunities/demo", getDemoMenuOpportunitiesController);
