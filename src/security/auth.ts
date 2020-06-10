import { Request, Response, NextFunction } from "express";

const jwt = require('jsonwebtoken');
const { promisify } = require('util');

module.exports = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        console.log('No token provided!');
        return res.status(401).send({ error: 'No token provided! '});
    }

    const [scheme, token] = authHeader.split(' ');

    try {
        const decoded = await promisify(jwt.verify)(token, "[__dany_makeup_jwt_secret__]");
        
        req.userId = decoded.id;

        return next();
    } catch (err) {
        console.log(err);
        return res.status(401).json({ error: 'Token invalid'});
    }
}