const db = require('knex')(require('../knexfile').development);

const save = id => data =>
  !data
    ? Promise.reject(null)
    : (id
      ? db('users').where({ slack_id: id })
          .update(json_reactions(data))
      : db('users')
        .insert(json_reactions(data)));

const get = id =>
  (!id
    ? db('users')
        .where(true)
    : db('users').where({ slack_id: id }))
  .then(users => users.map(json_reactions))

function json_reactions(data) {
  data.reactions_received = typeof data.reactions_received === 'string'
    ? JSON.parse(data.reactions_received)
    : JSON.stringify(data.reactions_received);

  data.reactions_given = typeof data.reactions_given === 'string'
    ? JSON.parse(data.reactions_given)
    : JSON.stringify(data.reactions_given);

  return data;
}

const updateSlackNames = (pairs) =>
  (db('users')
    .where({ slack_name: null }))
  .then(results =>
    results.filter(v => !v.slack_name))
  .then(results =>
    (results.map((e) => {
      e.slack_name = pairs[e.slack_id];
      return e;
    }))
  )
  .then(results =>
    (Promise.all(results.map(v =>
      db('users')
      .where({ id: v.id })
      .update(v))
    ))
  )
  .then(results => console.log(`${results.length} users updated with names`));

module.exports = {
  get,
  save,
  updateSlackNames,
};
