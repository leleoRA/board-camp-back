import { Router } from "express";
import categoryRouter from "./categoryRouter.js";
import customerRoute from "./customerRouter.js";
import gameRouter from "./gameRouter.js";

const router = Router();

router.use(categoryRouter);
router.use(gameRouter);
router.use(customerRoute);

export default router;
