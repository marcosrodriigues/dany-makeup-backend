import knex from 'knex';

const connection = knex({
    client: 'mysql2',
    connection: {
        host: '127.0.0.1',
        user: 'root',
        password: 'mysql_123',
        database: 'dany_makeup'
    },
    useNullAsDefault: true
});

export default connection;