import path from 'path';

const env_path = path.resolve(__dirname, '..', '..', 'env', 
        process.env.NODE_ENV === 'test' ? '.env.testing'
        : process.env.NODE_ENV === 'development' ? '.env.development'
        : process.env.NODE_ENV === 'production' ? '.env.production'
        : 'env/.env'
)

const dotenv = require('dotenv').config({
    path: env_path
});

export default dotenv;