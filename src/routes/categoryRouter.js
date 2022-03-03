import { Router } from "express";
import {
  getCaterogies,
  createCategory,
} from "../controllers/categoriesController.js";
import validateSchemaMiddleware from "../middlewares/validateSchemaMiddleware.js";
import categorySchema from "../schemas/categoySchema.js";

const categoryRouter = Router();

categoryRouter.get("/categories", getCaterogies);
categoryRouter.post(
  "/categories",
  validateSchemaMiddleware(categorySchema),
  createCategory
);

export default categoryRouter;
