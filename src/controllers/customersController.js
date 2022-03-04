import db from "../db.js";

export async function getCustomers(req, res) {
  const { cpf } = req.query;

  try {
    if (cpf) {
      const resultCpf = await db.query(
        `SELECT * FROM customers WHERE cpf LIKE '$1%'`,
        [cpf]
      );
      return res.send(resultCpf.rows);
    }

    const customers = await db.query(`SELECT * FROM customers`);

    res.send(customers.rows);
  } catch (error) {
    res.status(500).send(error);
  }
}

export async function getCustomer(req, res) {}

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

export async function updateCustomer(req, res) {}
