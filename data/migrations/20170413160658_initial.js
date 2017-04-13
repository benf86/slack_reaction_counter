
exports.up = function(knex, Promise) {
  return knex.schema.createTableIfNotExists('users', function (table) {
    table.increments('id');
    table.string('slack_name').unique();
    table.string('slack_id').notNullable().unique();
    table.json('reactions_received').notNullable().default('{}');
    table.json('reactions_given').notNullable().default('{}');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('users');
};
