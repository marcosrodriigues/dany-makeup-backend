import connection from "../database/connection";
import IStore from "../interface/IStore";
import { insert, select, remove, update } from "../database/sqlBuilder";

class StoreService {
    async find(name = "", limit = 5, offset = 0) {
        var query = connection('stores')
            .select<[IStore]>('stores.*')
        var queryCount = connection('stores')
            .count('id', { as : 'count'});
        
        if (name !== "") {
            query.where('name', 'like', `%${name}%`);
            queryCount.where('name', 'like', `%${name}%`);
        }

        query.limit(limit).offset(offset);

        try {
            const result = await query;
            const counter = await queryCount;

            return { stores: result , count: counter[0].count  };
        } catch (err) {
            throw err;
        }
    }

    async store(data = { store: {}, address: {} }) { 
        const { store, address } = data;

        try {
            
            const address_id = await insert('address', address);
            store.address_id = address_id[0];
            const insertedIds = await insert('stores', store);
            return insertedIds;
        } catch (err) {
            throw err;
        }
    }

    async update(data = { store: {}, address: {} }) {
        const { store, address } = data;

        try {
            await update('address', {
                data: address,
                conditions: [[
                    'id', '=', address.id
                ]]
            })
            await update('stores', {
                data: store,
                conditions: [
                    ['id', '=', store.id]
                ]
            });
            return { message: 'success' }
        } catch (err) {
            throw err;
        }
    }

    async findOne(id: number) {
        if (id === 0) throw "Store not provided";

        try {
            const store = (await select('stores', {
                fields: [],
                conditions: [['id', '=', id]]
            }))[0];

            store.address = (await select('address', {
                fields: [],
                conditions: [['id', '=', store.address_id]]
            }))[0];

            return store;
        } catch (err) {
            throw err;
        }
    }

    async delete(id: number) {
        if (id === 0) return;

        try {
            const store = await this.findOne(id);

            await remove('stores', {
                conditions: [
                    ['id', '=', id]
                ]
            });

            await remove('address', {
                conditions: [
                    ['id', '=', store.address_id]
                ]
            });
            return { message: 'success' };
        } catch (err) {
            throw err;
        }
    }
}

export default StoreService;