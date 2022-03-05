import db from "../db.js";
import dayjs from "dayjs";

export async function getRentals(req, res) {}

export async function createRental(req, res) {
  const { customerId, gameId, daysRented } = req.body;

  try {
    const resultGame = await db.query(`SELECT * FROM games WHERE id = $1`, [
      gameId,
    ]);

    if (resultGame.rowCount === 0) return res.sendStatus(400);

    const resultCustomer = await db.query(
      `SELECT * FROM customers WHERE id = $1`,
      [customerId]
    );

    if (resultCustomer.rowCount === 0) return res.sendStatus(400);

    const rentedGames = await db.query(
      `SELECT * FROM rentals WHERE "gameId" = $1 AND "returnDate" IS NULL`,
      [gameId]
    );

    const resultGameQuantity = await db.query(
      `SELECT "stockTotal" FROM games WHERE id = $1`,
      [gameId]
    );

    const gameQuantity = resultGameQuantity.rows[0].stockTotal;

    if (rentedGames.rowCount >= gameQuantity)
      return res.status(400).send("Jogo indisponível.");

    const rentDate = dayjs().format("YYYY-MM-DD");
    const originalPrice = resultGame.rows[0].pricePerDay * daysRented;

    await db.query(
      `INSERT INTO rentals ("customerId", "gameId", "rentDate", "daysRented", "returnDate", "originalPrice", "delayFee") VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [customerId, gameId, rentDate, daysRented, null, originalPrice, null]
    );

    res.sendStatus(201);
  } catch (error) {
    res.status(500).send(error);
  }
}

export async function returnRental(req, res) {
  const { id } = req.params;

  try {
    const resultRental = await db.query(`SELECT * FROM rentals WHERE id = $1`, [
      id,
    ]);

    if (resultRental.rowCount === 0) return res.sendStatus(404);

    if (resultRental.rows[0].returnDate !== null)
      return res.status(400).send("Locação já finalizada.");

    const parsedExpectedReturnDate = Date.parse(
      dayjs(resultRental.rows[0].rentDate).add(
        resultRental.rows[0].daysRented,
        "day"
      )
    );

    const returnDate = dayjs().format("YYYY-MM-DD");

    const parsedReturnDate = Date.parse(returnDate);

    const diffDays = Math.round(
      (parsedReturnDate - parsedExpectedReturnDate) / (1000 * 3600 * 24)
    );

    const resultGame = await db.query(`SELECT * FROM games WHERE id = $1`, [
      resultRental.rows[0]["gameId"],
    ]);

    let delayFee = 0;

    if (diffDays > 0) {
      delayFee = resultGame.rows[0].pricePerDay * diffDays;
    }

    await db.query(
      `UPDATE rentals SET "returnDate" = $1, "delayFee" = $2 WHERE id = $3`,
      [returnDate, delayFee, id]
    );

    res.sendStatus(200);
  } catch (error) {
    res.status(500).send(error);
  }
}

export async function deleteRental(req, res) {
  const { id } = req.params;

  try {
    const resultRental = await db.query(`SELECT * FROM rentals WHERE id = $1`, [
      id,
    ]);

    if (resultRental.rowCount === 0) return res.sendStatus(404);

    if (resultRental.rows[0].returnDate !== null)
      return res.status(400).send("Locação já finalizada.");

    await db.query(`DELETE FROM rentals WHERE id = $1`, [id]);

    res.sendStatus(200);
  } catch (error) {
    res.status(500).send(error);
  }
}
