const dotenv = require('dotenv').config({
    path: process.env.NODE_ENV === 'test' ? 'env/.env.testing'
        : process.env.NODE_ENV === 'development' ? 'env/.env.development'
        : process.env.NODE_ENV === 'production' ? 'env/.env.production'
        : 'env/.env'
});

export default dotenv;