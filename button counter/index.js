const express = require("express");
const { Pool } = require("pg");
const path = require("path");

const app = express();
app.use(express.json());

// Serve frontend files
app.use(express.static("public"));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Record a click
app.post("/click", async (req, res) => {
  const { buttonId } = req.body;
  if (!buttonId) {
    return res.status(400).json({ error: "buttonId required" });
  }

  await pool.query(
    "INSERT INTO button_clicks (button_id) VALUES ($1)",
    [buttonId]
  );

  res.json({ success: true });
});

// Get stats
app.get("/stats", async (req, res) => {
  const { buttonId, from, to } = req.query;

  const result = await pool.query(
    `
    SELECT COUNT(*) 
    FROM button_clicks
    WHERE button_id = $1
    AND clicked_at BETWEEN $2 AND $3
    `,
    [buttonId, from, to]
  );

  res.json({ count: Number(result.rows[0].count) });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));

app.get("/stats/week", async (req, res) => {
  const result = await pool.query(`
    SELECT
      button_id,
      COUNT(*) AS total
    FROM button_clicks
    WHERE clicked_at >= NOW() - INTERVAL '7 days'
    GROUP BY button_id
    ORDER BY button_id;
  `);

  res.json(result.rows);
});
