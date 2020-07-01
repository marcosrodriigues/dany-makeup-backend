import { insert, select, remove, update, count, buildConditions } from "../database/sqlBuilder";

class StoreService {
    async find(params = { filter: { }, pagination: {} }) {
        const { filter, pagination } = params;
        
        const conditions = buildConditions({ filter });

        try {
            const options: any  = {
                fields: ['*'],
                conditions: conditions,
                pagination: pagination
            }
            const result = await select('stores', options);
            const counter = await count('stores', options);

            return { stores: result , count: counter[0].count  };
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

    async store(data = { store: {}, address: {} }) { 
        const { store, address } = data;

        try {
            const address_id = await insert('address', address);
            store.address_id = address_id[0];
            await insert('stores', store);
            return { message: 'success' };
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