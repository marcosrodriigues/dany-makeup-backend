import jwt from 'jsonwebtoken';
const { promisify } = require('util');

const SECRET = "[__dany_makeup_jwt_secret__]";

class UtilJwt {
    async generateToken(id: number) {
        return await jwt.sign({ id }, SECRET, { expiresIn: 86400 });
    }

    async decode(token: string) {
        const decoded = await promisify(jwt.verify)(token, SECRET);
        return decoded;
    }
}

export default UtilJwt;