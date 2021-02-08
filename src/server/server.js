const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

const port = 8080;

const JAPI = require('./japi');

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

app.listen(port, async () => {
  console.log(`Listening on ${port}`);
});
