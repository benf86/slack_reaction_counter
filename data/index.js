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

module.exports = {
  get,
  save,
};
