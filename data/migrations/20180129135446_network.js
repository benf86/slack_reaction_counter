
exports.up = function(knex, Promise) {
  return knex.schema.table('users', function (table) {
    table.json('interactions_active').default('{}');
    table.json('interactions_passive').default('{}');
  });
};

exports.down = function(knex, Promise) {};
