import { Router } from "express";
import {
  getRentals,
  createRental,
  returnRental,
  deleteRental,
} from "../controllers/rentalsController.js";

const rentalRouter = Router();

rentalRouter.get("/rentals", getRentals);
rentalRouter.post("/rentals", createRental);
rentalRouter.post("/rentals/:id/return", returnRental);
rentalRouter.delete("/rentals/:id", deleteRental);

export default rentalRouter;
