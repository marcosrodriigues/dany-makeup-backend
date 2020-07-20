import IUser from '../interface/IUser';
import Crypto from '../util/crypto';
import { Request } from 'express';
import AddressService from './AddressService';
import connection from '../database/connection';
import { update } from '../database/sqlBuilder';
import { convertToDatabaseDate } from '../util/util';

const crypt = new Crypto();

const addressService = new AddressService();

class UserService {
    async findAll(search = "", limit = 5, offset = 0) {
        var query = connection('users').where('removed', false).select('*');
        var queryCount = connection('users').where('removed', false).count('id', { as : 'count'});

        if (search !== "") {
            query.andWhere(function() {
                this.orWhere('name', 'like', `%${search}%`)
                .orWhere('email', 'like', `%${search}%`)
                .orWhere('whatsapp', 'like', `%${search}%`)
            })
            queryCount.andWhere(function() {
                this.orWhere('name', 'like', `%${search}%`)
                .orWhere('email', 'like', `%${search}%`)
                .orWhere('whatsapp', 'like', `%${search}%`)
            })
        }

        query.limit(limit).offset(offset);

        const users = await query;
        const counter = await queryCount;

        return {users , count: counter[0].count};
    }

    async findOne(id: number) {
        try {
            const user = await connection('users').where({ id, removed: false }).first();
            const address = await addressService.findByUser(user.id);

            return { user, address };
        } catch (err) {
            throw err;
        }
    }

    async findByEmail(email: string) {
        const user = await connection('users').where('email', '=', email).select('*').first();
        return user;
    }

    async save(user: IUser) {
        const saved = await connection('users').insert(user);
        return saved;
    }

    async update(data = { user: {} as IUser }) {
        const { user } = data;
        if (!user.id) throw "No user provided on update";
        user.created_at = convertToDatabaseDate(new Date(user.created_at));

        try {
            await update('users', {
                data: user,
                conditions: [
                    ['id', '=', user.id]
                ]
            });

            return { message: 'success' };
        } catch (err) {
            throw err;
        }
    }

    async verifyMail(email: string) {
        const user = await connection('users').where('email', '=', email).select('*').first();

        if (user)
            return false;

        return true;
    }

    async findByFacebookId(fb_id: string) {
        const user = await connection('users').where('fb_id', '=', fb_id).select('*').first();
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