const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public")); // serve your html files

// --- In-memory data store ---
// Each group has buttons and 10 weeks of counts
let statsData = [
  {
    group: "10",
    buttons: [
      { name: "Ice Block", weekly: Array(10).fill(0) },
      { name: "Sit with friend", weekly: Array(10).fill(0) },
      { name: "Stationery Pack", weekly: Array(10).fill(0) },
      { name: "Tatoo", weekly: Array(10).fill(0) }
    ]
  },
  {
    group: "30",
    buttons: [
      { name: "Duty with a teacher", weekly: Array(10).fill(0) },
      { name: "Game with a friend", weekly: Array(10).fill(0) },
      { name: "Special chair in class", weekly: Array(10).fill(0) }
    ]
  },
  {
    group: "50",
    buttons: [
      { name: "Notepad", weekly: Array(10).fill(0) },
      { name: "Lolly Bag", weekly: Array(10).fill(0) },
      { name: "15 mins computer time", weekly: Array(10).fill(0) },
      { name: "Morning tea with 3 friends", weekly: Array(10).fill(0) }
    ]
  },
  // Add other groups as needed...
];

// --- Endpoints ---

// Get stats
app.get("/stats", (req, res) => {
  res.json(statsData);
});

// Increment button press
// POST { buttonId: "Ice Block", week: 0 }
app.post("/click", (req, res) => {
  const { buttonId, week } = req.body;

  statsData.forEach(group => {
    group.buttons.forEach(btn => {
      if (btn.name === buttonId && week >= 0 && week < 10) {
        btn.weekly[week] += 1;
      }
    });
  });

  res.json({ success: true });
});

// Hard reset all stats
app.post("/reset", (req, res) => {
  statsData.forEach(group => {
    group.buttons.forEach(btn => {
      btn.weekly = Array(10).fill(0);
    });
  });
  res.json({ success: true });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
