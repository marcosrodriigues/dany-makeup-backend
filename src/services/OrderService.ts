import { buildConditions, count, select } from "../database/sqlBuilder";

class OrderService {
    async find(params = { filter: { }, pagination: {} }) {
        const { filter, pagination } = params;
        
        const conditions = buildConditions({ filter });

        try {
            const options: any  = {
                fields: ['*'],
                conditions,
                pagination
            }
            const result = await select('orders', options);
            const counter = await count('orders', options);

            return { orders: result , count: counter[0].count  };
        } catch (err) {
            throw err;
        }
    }

    async findOne(id: number) {
        if (id <= 0) return undefined;

        try {
            const order = (await select('orders', {
                fields: [],
                conditions: [['id', '=', id]]
            }))[0];
            return order;
        } catch (err) {
            throw err;
        }
    }

    async store() {

    }

    async update() {

    }
}

export default OrderService;
