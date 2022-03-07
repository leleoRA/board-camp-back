import db from "../db.js";
import SqlString from 'sqlstring';

export async function getCaterogies(req, res) {
  const { limit, offset, order, desc } = req.query;

  try {
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
      orderByValue = `ORDER BY ${SqlString.escape(order)}`;
    }

    let descCondition = "";
    if (desc) {
      descCondition = `DESC`;
    }

    const result = await db.query(
      `SELECT * FROM categories ${limitValue} ${offsetValue} ${orderByValue} ${descCondition}`
    );

    res.send(result.rows);
  } catch (error) {
    res.status(500).send(error);
  }
}

export async function createCategory(req, res) {
  const { name } = req.body;

  try {
    const result = await db.query(`SELECT * FROM categories WHERE name = $1`, [
      name,
    ]);

    if (result.rowCount > 0) {
      return res.status(409).send("Categoria já cadastrada.");
    }

    await db.query(`INSERT INTO categories (name) VALUES ($1)`, [name]);

    res.sendStatus(201);
  } catch (error) {
    res.status(500).send(error);
  }
}
