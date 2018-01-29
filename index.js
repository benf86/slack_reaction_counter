const SLACKTOKEN = require('./authorization').SLACKTOKEN;
const INTERNALTOKEN = require('./authorization').INTERNALTOKEN;
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./data');

const app = express();

app.use(cors());

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
app.use(router);

router.post('/event', handleEvent);
router.get('/graph', sendGraph);
router.get('/', returnLadder);

const globals = { users: {} };
const types = require('./eventTypes')(globals);

function handleEvent(req, res, next) {
  console.log(JSON.stringify(req.body.event, 0, 2));
  return req.body.type === 'url_verification'
    ? res.json({ challenge: req.body.challenge })
    : types[req.body.event.type](req.body.event)
      .then(() => res.json({ challenge: req.body.challenge }));
}

function returnLadder(req, res, next) {
  //if (req.query.token !== INTERNALTOKEN) return res.status(403) && res.send();
  return db.get()
    .then(users => res.json(users));
}

function sendGraph(req, res, next) {
  res.sendFile('./bleh.html', { root: __dirname + '/' });
}

require('request-promise')
.get(`https://slack.com/api/users.list?token=${require('./authorization').APITOKEN}`)
.then(r => JSON.parse(r))
.then(({ members }) => members
  //.filter(({ id, name, is_bot }) => (is_bot ? false : { id, name }))
  .map(({ id, name }) => ({ slack_id: id, slack_name: name })))
  .reduce((prev, cur) => Object.assign(prev, {
    [cur.slack_id]: cur.slack_name,
    [cur.slack_name]: cur.slack_id,
  }), {})
.tap(r => (globals.users = r))
.tap(db.updateSlackNames)
//.tap(r => console.log(JSON.stringify(r, 0, 2)))
.then(() => app.listen(8891, () => console.log('Listening...')));
