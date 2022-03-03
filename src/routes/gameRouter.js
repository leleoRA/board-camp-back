import { Router } from "express";
import { getGames, createGame } from "../controllers/gamesController.js";
import validateSchemaMiddleware from "../middlewares/validateSchemaMiddleware.js";
import gameSchema from "../schemas/gameSchema.js";

const gameRouter = Router();

gameRouter.get("/games", getGames);
gameRouter.post("/games", validateSchemaMiddleware(gameSchema), createGame);

export default gameRouter;
