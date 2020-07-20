import connection from "../database/connection";
import { insert, update, remove } from "../database/sqlBuilder";
import IAddress from "../interface/IAddress";

class AddressService {
    async store(data = { address: {}}) {
        const { address } = data;
        try {
            const id = await insert('address', address);
            return id;
        } catch (err) {
            console.log('ERR STORE', err)
            throw err;
        }
    }
    async addressUser(data = { user_id: 0, address_id: 0}) {
        const { user_id, address_id } = data;
        if (user_id === 0 || address_id === 0) throw "No user or address provided"
        const user_address = {
            user_id,
            address_id
        };
        try {
            await insert('user_address', user_address);
            return;
        } catch (err) {
            throw err;
        }
    }
    async findByUser(id: number) {
        if (!id) throw "Not user provided!";
        try {
            const address = await connection('address')
                .join('user_address', 'user_address.address_id', 'address.id')
                .where('user_address.user_id', id)
                .select('address.*')

            return address;
        } catch (err) {
            console.log('ERROR ADDRESS SERVICE - FIND BY USER');
            throw err;
        }
    }
    async update(data = { address: {} as IAddress }) {
        const { address } = data;
        if (address.id === undefined) throw "No address provided"
        try {
            await update('address', {
                data: address,
                conditions: [
                    ['id', '=', address.id]
                ]
            });
            return;
        } catch (err) {
            console.log('ERR STORE', err)
            throw err;
        }
    }

    async delete(id: number) {
        if (id === 0) return;

        try {
            await remove('address', {
                conditions: [
                    ['id', '=', id]
                ]
            });
            return { message: 'success' };
        } catch (err) {
            throw err;
        }
    }
}

export default AddressService;