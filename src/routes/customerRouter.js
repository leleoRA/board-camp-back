import { Router } from "express";
import {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
} from "../controllers/customersController.js";
import validateSchemaMiddleware from "../middlewares/validateSchemaMiddleware.js";
import customerSchema from "../schemas/customerSchema.js";

const customerRoute = Router();

customerRoute.get("/customers", getCustomers);
customerRoute.get("/customers/:id", getCustomer);
customerRoute.post(
  "/customers",
  validateSchemaMiddleware(customerSchema),
  createCustomer
);
customerRoute.put(
  "/customers/:id",
  validateSchemaMiddleware(customerSchema),
  updateCustomer
);

export default customerRoute;
