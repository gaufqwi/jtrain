const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3');
const sqlite = require('sqlite');

const JAPI = require('./japi');

const port = 8080;

const app = express();
app.use(cors());
app.use(express.json());

let db;

const japi = new JAPI();

app.get('/api/test', (req, res) => {
  console.log('Test api');
  res.status(200).end()
  //res.json({test: 'Check', timestamp: `${Date()}`});
});

app.get('/api/jbyid/:jid', async (req, res) => {
  res.json(await japi.getMatchById(req.params.jid));
});

app.get('/api/jbydate/:date', async (req, res) => {
  res.json(await japi.getMatchByDate(req.params.date));
});

app.post('/api/gamedata', async (req, res) => {
  for (const clue of req.body.clues) {
    await db.run('INSERT INTO clues (date, round, category, value, clue, correct) VALUES (?, ?, ?, ?, ?, ?)',
        [req.body.date.date, clue.round, clue.category, clue.value, clue.clue, clue.correct]);
  }
  const stats = req.body.stats;
  //console.log(stats);
  await db.run('INSERT INTO games '+
      '(date, coryat_j, coryat_dj, coryat_combined, right_j, right_dj, wrong_j, wrong_dj, dd_j, dd_dj, lt_j, lt_dj, runs_j, runs_dj, bottom_j, bottom_dj) VALUES ' +
      '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [req.body.date,
        stats.score['Jeopardy'], stats.score['Double Jeopardy'], stats.coryats['combined'] || 0,
        stats.clueRightCount['Jeopardy'], stats.clueRightCount['Double Jeopardy'],
        stats.clueWrongCount['Jeopardy'], stats.clueWrongCount['Double Jeopardy'],
        stats.ddRight['Jeopardy'], stats.ddRight['Double Jeopardy'],
        stats.ltTotal['Jeopardy'], stats.ltTotal['Double Jeopardy'],
        stats.runs['Jeopardy'].length, stats.runs['Double Jeopardy'].length,
        stats.bottomRowClues['Jeopardy'].length, stats.bottomRowClues['Double Jeopardy'].length
  ]);
  res.status(201).end();
});

app.listen(port, async () => {
  db = await sqlite.open({filename: './database/jeopardy.db', driver: sqlite3.Database});
  console.log('Database connected');
  console.log(`Listening on ${port}`);
});
