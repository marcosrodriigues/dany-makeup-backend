import path from 'path';

const env_path = path.resolve(__dirname, '..', '..', 'env', 
        process.env.NODE_ENV === 'test' ? '.env.testing'
        : process.env.NODE_ENV === 'production' ? '.env.production'
        : '.env.development'   
)

const dotenv = require('dotenv').config({
    //path: env_path
});

export default dotenv;