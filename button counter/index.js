const express = require("express");
const { Pool } = require("pg");

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

// Weekly stats
app.get("/stats/week", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT button_id, COUNT(*) AS total
      FROM button_clicks
      WHERE clicked_at >= NOW() - INTERVAL '7 days'
      GROUP BY button_id
      ORDER BY button_id;
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load weekly stats" });
  }
});

// All-time stats
app.get("/stats/all", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT button_id, COUNT(*) AS total
      FROM button_clicks
      GROUP BY button_id
      ORDER BY button_id;
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load all-time stats" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
