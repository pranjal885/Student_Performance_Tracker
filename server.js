const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/students', (req, res) => {
  db.all("SELECT * FROM students ORDER BY gpa DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/add', (req, res) => {
  const { name, gpa } = req.body;
  db.run("INSERT INTO students (name, gpa) VALUES (?, ?)", [name, gpa], function(err) {
    if (err) return res.status(500).send("Error inserting student");
    res.send("Student added");
  });
});

app.get('/export-csv', (req, res) => {
  db.all("SELECT * FROM students ORDER BY gpa DESC", [], (err, rows) => {
    if (err) {
      return res.status(500).send('Error fetching students');
    }
    if (!rows.length) {
      return res.status(404).send('No student data found');
    }

    const headers = Object.keys(rows[0]);
    const csvRows = [
      headers.join(','), // header row
      ...rows.map(row =>
        headers.map(field => `"${String(row[field]).replace(/"/g, '""')}"`).join(',')
      )
    ];
    const csvData = csvRows.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=students.csv');
    res.send(csvData);
  });
});


app.get('/hello', (req, res) => {
  res.send("Hello route works!");
});

app.use(express.static('public'));

app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
