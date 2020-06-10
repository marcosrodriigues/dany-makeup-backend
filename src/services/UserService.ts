import database from '../database/connection';
import IUser from '../interface/IUser';
import Crypto from '../util/crypto';
import { Request } from 'express';

const crypt = new Crypto();

class UserService {
    async findAll() {
        const users = await database('users').select('*');
        return users;
    }

    async findOne(id: number) {
        const user = await database('users').where('id', '=', id).select('*').first();
        return user;
    }

    async findByEmail(email: string) {
        const user = await database('users').where('email', '=', email).select('*').first();
        return user;
    }

    async save(user: IUser) {
        const saved = await database('users').insert(user);
        return saved;
    }

    async update(user :IUser) {
        try {
            if (user.id) {
                const updated = await database('users').update(user).where("id", '=', user.id);
                return updated;
            }
            console.log("ID not found on update user");
            return undefined;
        } catch (err) {
            console.log(err);
            return undefined;
        }
    }

    async verifyMail(email: string) {
        const user = await database('users').where('email', '=', email).select('*').first();

        if (user)
            return false;

        return true;
    }

    async findByFacebookId(fb_id: string) {
        const user = await database('users').where('fb_id', '=', fb_id).select('*').first();
        return user ? user : undefined;
    }

    async findMe(request: Request) {
        try {
            const { userId } = request;
            const user = await this.findOne(userId);
            return user;
        } catch (err) {
            console.log("error userService.findMe: " + err);
            return undefined;
        }
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