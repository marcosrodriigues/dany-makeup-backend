import database from '../database/connection';
import IUser from '../interface/IUser';
import Crypto from '../util/crypto';

const crypt = new Crypto();

class UserService {
    async findAll() {
        const users = await database('users').select('*');
        return users;
    }

    async findOne(id: number) {
        const user = await database('users').where('id', '=', id).select('*');
        return user;
    }

    async findByEmail(email: string) {
        const user = await database('users').where('email', '=', email).select('*').first();
        return user;
    }

    async save(user: IUser) {
        const saved = await database('users').insert(user);
        console.log(saved);
        return user;
    }

    async verifyMail(email: string) {
        const user = await database('users').where('email', '=', email).select('*').first();

        if (user)
            return false;

        return true;
    }

    async login(email: string, password: string) {
        const user = await this.findByEmail(email);

        if (!user) return undefined;

        const returned = await crypt.compare(password, user.password).then((result) => {
            return result ? user : undefined;
        });

        return returned;
    }
}

export default UserService;