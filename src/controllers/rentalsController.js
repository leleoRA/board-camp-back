import db from "../db.js";
import dayjs from "dayjs";
import SqlString from 'sqlstring';

export async function getRentals(req, res) {
  const { customerId, gameId, offset, limit, order, desc } = req.query;

  let filterParams = "";

  if (customerId && !gameId) {
    filterParams = `WHERE customers.id=${SqlString.escape(customerId)}`;
  }

  if (!customerId && gameId) {
    filterParams = `WHERE games.id=${gameId}`;
  }

  if (customerId && gameId) {
    filterParams = `WHERE games.id=${SqlString.escape(gameId)} AND customers.id=${SqlString.escape(customerId)}`;
  }

  let offsetValue = "";
  if (offset) {
    offsetValue = `OFFSET ${SqlString.escape(offset)}`;
  }

  let limitValue = "";
  if (limit) {
    limitValue = `LIMIT ${SqlString.escape(limit)}`;
  }

  let orderByValue = "";
  if (order) {
    orderByValue = `ORDER BY rentals."${SqlString.escape(order)}"`;
  }

  let descCondition = "";
  if (desc) {
    descCondition = `DESC`;
  }

  try {
    const result = await db.query(`
  SELECT 
    rentals.*, 
    customers.id AS "customerId", 
    customers.name AS "customerName",
    games.id AS "gameId",
    games.name AS "gameName",
    games."categoryId",
    categories.name AS "categoryName"
  FROM rentals 
    JOIN customers ON customers.id=rentals."customerId"
    JOIN games ON games.id=rentals."gameId"
    JOIN categories ON categories.id=games."categoryId"
    ${filterParams}
    ${limitValue} 
    ${offsetValue}
    ${orderByValue} 
    ${descCondition}
  `);

    if (result.rowCount === 0) return res.sendStatus(404);

    res.send(
      result.rows.map((row) => {
        const {
          id,
          customerId,
          gameId,
          rentDate,
          daysRented,
          returnDate,
          originalPrice,
          delayFee,
          customerName,
          gameName,
          categoryId,
          categoryName,
        } = row;

        return {
          id,
          customerId,
          gameId,
          rentDate,
          daysRented,
          returnDate,
          originalPrice,
          delayFee,
          customer: {
            id: customerId,
            name: customerName,
          },
          game: {
            id: gameId,
            name: gameName,
            categoryId,
            categoryName,
          },
        };
      })
    );
  } catch (error) {
    res.status(500).send(error);
  }
}

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
