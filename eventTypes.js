const db = require('./data');

module.exports = globals => {
  function createDefaultUser(slack_id) {
    return {
      slack_id,
      slack_name: globals.users[slack_id],
      reactions_received: {},
      reactions_given: {},
    };
  }

  const actions = ['reactions_received', 'reactions_given'];

  const modifyReactions = user => action => reaction => offset => {
    if (Array.isArray(user)) user = user[0];
    if (!user[actions[action]]) {
      user[actions[action]] = {};
    }
    if (!user[actions[action]][reaction]) {
      user[actions[action]][reaction] = 0;
    }

    user[actions[action]][reaction]
      ? user[actions[action]][reaction] += offset
      : offset > 0
        ? user[actions[action]][reaction] = 1
        : user[actions[action]][reaction] = 0;

    return user;
  };

  const react = offset => ({ reaction, item_user: reactee, user: reactor }) => {
    if (!reactee || !reactor || reactee === reactor) return Promise.resolve();

    let reacteeP = db.get(reactee)
      .then(([user]) => (user
        ? user
        : db.save()(createDefaultUser(reactee))
          .then(() => db.get(reactee))))
      .then(user => db.save(reactee)(modifyReactions(user)(0)(reaction)(offset)));

    let reactorP = db.get(reactor)
      .then(([user]) => (user
        ? user
        : db.save()(createDefaultUser(reactor))
          .then(() => db.get(reactor))))
      .then(user => db.save(reactor)(modifyReactions(user)(1)(reaction)(offset)));

    return Promise.all([reacteeP, reactorP]);
  };

  return {
    reaction_added: react(1),
    reaction_removed: react(-1),
  };
};
