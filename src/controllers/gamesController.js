import db from "../db.js";

export async function getGames(req, res) {}

export async function createGame(req, res) {
  const { name, image, stockTotal, categoryId, pricePerDay } = req.body;

  try {
    const resultCategoryId = await db.query(
      `
        SELECT * FROM categories WHERE id = $1
    `,
      [categoryId]
    );

    if (resultCategoryId.rowCount === 0) return res.sendStatus(400);

    const resultName = await db.query(
      `
        SELECT * FROM games WHERE name = $1
    `,
      [name]
    );

    if (resultName.rowCount > 0) {
      return res.status(409).send("Jogo já cadastrado.");
    }

    await db.query(
      `
        INSERT INTO games (name, image, "stockTotal", "categoryId", "pricePerDay") VALUES ($1, $2, $3, $4, $5)
    `,
      [name, image, stockTotal, categoryId, pricePerDay]
    );

    res.sendStatus(201);
  } catch (error) {
    res.status(500).send(error);
  }
}
