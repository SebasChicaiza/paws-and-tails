require('dotenv').config();
const { Pool } = require('pg');

// Configuración del pool de conexiones
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Función para ejecutar consultas
const query = async (text, params) => {
  try {
    const res = await pool.query(text, params);
    return res;
  } catch (err) {
    console.error('Error ejecutando la consulta:', err);
    throw err;
  }
};

module.exports = { query, pool };
