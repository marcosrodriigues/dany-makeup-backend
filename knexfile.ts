import path from 'path';

module.exports = {
    client: 'mysql2',
    version: '5.7',
    connection: {
        host: '127.0.0.1',
        user: 'root',
        password: 'mysql_123',
        database: 'dany_makeup'
    },
    migrations: {
        directory: path.resolve(__dirname, 'src', 'database', 'migrations')
    },
    seeds: {
        directory: path.resolve(__dirname, 'src', 'database', 'seeds')
    },
    
    useNullAsDefault: true
}