import db from "../db.js";

export async function getCustomers(req, res) {
  const { cpf, limit, offset } = req.query;

  try {
    let offsetValue = "";
    if (offset) {
      offsetValue = `OFFSET ${offset}`;
    }

    let limitValue = "";
    if (limit) {
      limitValue = `LIMIT ${limit}`;
    }

    if (cpf) {
      const resultCpf = await db.query(
        `SELECT * FROM customers WHERE cpf LIKE $1`,
        [`${cpf}%`]
      );
      return res.send(resultCpf.rows);
    }

    const customers = await db.query(
      `SELECT * FROM customers ${limitValue} ${offsetValue}`
    );

    res.send(customers.rows);
  } catch (error) {
    res.status(500).send(error);
  }
}

export async function getCustomer(req, res) {
  const { id } = req.params;

  try {
    const customer = await db.query(`SELECT * FROM customers WHERE id = $1`, [
      id,
    ]);

    if (customer.rowCount === 0) {
      return res.sendStatus(404);
    }

    res.send(customer.rows[0]);
  } catch (error) {
    res.status(500).send();
  }
}

export async function createCustomer(req, res) {
  const { name, phone, cpf, birthday } = req.body;

  const hasCpf = await db.query(
    `
    SELECT * FROM customers WHERE cpf = $1
  `,
    [cpf]
  );

  if (hasCpf.rowCount > 0) return res.sendStatus(409);

  await db.query(
    `
    INSERT INTO customers (name, phone, cpf, birthday) VALUES ($1, $2, $3, $4)
  `,
    [name, phone, cpf, birthday]
  );

  res.sendStatus(201);
}

export async function updateCustomer(req, res) {
  const { name, phone, cpf, birthday } = req.body;
  const { id } = req.params;

  try {
    const resultCustomer = await db.query(
      `SELECT * FROM customers WHERE id = $1 `,
      [id]
    );

    const editingCustomer = resultCustomer.rows[0];

    if (editingCustomer.cpf !== cpf) {
      const hasCpf = await db.query(`SELECT * FROM customers WHERE cpf = $1`, [
        cpf,
      ]);

      if (hasCpf.rowCount > 0) {
        return res.sendStatus(409);
      }
    }

    await db.query(
      `UPDATE customers SET name = $1, phone = $2, cpf = $3, birthday = $4 WHERE id = $5`,
      [name, phone, cpf, birthday, id]
    );

    res.sendStatus(200);
  } catch (error) {
    res.status(500).send(error);
  }
}
