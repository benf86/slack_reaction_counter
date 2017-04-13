module.exports = {
  development: {
    client: 'sqlite3',
    useNullAsDefault: true,
    connection: {
      filename: './data/mydb.sqlite',
    },
    migrations: {
      directory: './data/migrations',
    }
  }
};
