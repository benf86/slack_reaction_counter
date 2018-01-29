const db = require('./data');

module.exports = globals => {
  function createDefaultUser(slack_id) {
    return {
      slack_id,
      slack_name: globals.users[slack_id],
      reactions_received: {},
      reactions_given: {},
      interactions_active: {},
      interactions_passive: {},
    };
  }

  const actions = ['reactions_received', 'reactions_given'];

  // Modify reaction counters
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

  // Modify interaction counters
  const modifyInteractions = usersP => interaction => {
    [reactorP, reacteeP] = usersP;
    return Promise.all([reactorP, reacteeP])
      .then(users => {
        [reactor, reactee] = users;
        if (Array.isArray(reactor)) reactor = reactor[0];
        if (Array.isArray(reactee)) reactee = reactee[0];

        if (!reactor.interactions_active[reactee.slack_name]) {
          reactor.interactions_active[reactee.slack_name] = [];
        }

        reactor.interactions_active[reactee.slack_name].push(interaction);

        if (!reactee.interactions_passive[reactor.slack_name]) {
          reactee.interactions_passive[reactor.slack_name] = [];
        }

        reactee.interactions_passive[reactor.slack_name].push(interaction);

        return [reactor, reactee];
      });

  };

  const react = offset => ({ reaction, item_user: reactee, user: reactor }) => {
    if (!reactee || !reactor || reactee === reactor) return Promise.resolve();

    return Promise.all([
      db.get(reactor)
      .then(([user]) => (user
        ? user
        : db.save()(createDefaultUser(reactor))
          .then(() => db.get(reactor)))),

      db.get(reactee)
      .then(([user]) => (user
        ? user
        : db.save()(createDefaultUser(reactee))
          .then(() => db.get(reactee))))
    ])
    .then(([reactorP, reacteeP]) => modifyInteractions([reactorP, reacteeP])(reaction))
    .then(users => Promise.all([
      db.save(reactor)(modifyReactions(users[0])(1)(reaction)(offset)),
      db.save(reactee)(modifyReactions(users[1])(0)(reaction)(offset))
      ])
    );


    //return Promise.all([reacteeP, reactorP]);
  };

  return {
    reaction_added: react(1),
    reaction_removed: react(-1),
  };
};
