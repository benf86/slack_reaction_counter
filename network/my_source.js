function parseUsers (usersRaw) {
  usersRaw = usersRaw
    .map(u => ({
      slack_name: u.slack_name,
      interactions_active: (() => {
        return Object.keys(u.interactions_active)
            .map(k => ({ [k]: u.interactions_active[k].length }))
        })(),
      interactions_passive: (() => {
        return Object.keys(u.interactions_passive)
            .map(k => ({ [k]: u.interactions_passive[k].length }))
      })(),
      detailed_interactions_active: (() => {
        return Object.keys(u.interactions_active)
            .map(k => ({
              slack_name: k,
              strength: u.interactions_active[k].length }))
        })(),
      detailed_interactions_passive: (() => {
        return Object.keys(u.interactions_passive)
            .map(k => ({
              slack_name: k,
              strength: u.interactions_passive[k].length }))
        })(),
    }))

  var users = usersRaw
    .reduce((prev, cur) => (prev[cur.slack_name] = {
      slack_name: cur.slack_name,
      detailed_interactions_active: cur.detailed_interactions_active,
      detailed_interactions_passive: cur.detailed_interactions_passive,
      interactions_active: (() =>
        cur.interactions_active
          .reduce((prev1, cur1) => Object.assign(prev1, cur1), {}))(),
      interactions_passive: (() =>
        cur.interactions_passive
          .reduce((prev1, cur1) => Object.assign(prev1, cur1), {}))()
    }, prev), {});

  var nodes = usersRaw.map(u => ({ id: u.slack_name }))

  console.log(nodes)

  var links = usersRaw
    .map((u, i, a) => u.detailed_interactions_active
        .map(ia => ({
            source: u.slack_name,
            target: ia.slack_name,
            value: ia.strength +  users[u.slack_name].interactions_passive[ia.slack_name] || 0,
      }))
    )
    .reduce((prev, cur) => prev.concat(cur), []);




  //console.log(connectionsPretty)

  return {
    nodes,
    links,
    connectionsPretty: users,
  }
}
