import { buildConditions, count, select, insert, update } from "../database/sqlBuilder";
import { isOrderValid, convertToDatabaseDate } from "../util/util";
import ItemService from './ItemService'
import TransactionService from "./TransactionService";

const itemService = new ItemService();
const transactionService = new TransactionService();
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

            const orders = await Promise.all(result.map(async ord => {
                ord.items = await itemService.findByOrder(ord.id);
                ord.transaction = await transactionService.findById(ord.transaction_id)
                return ord;
            }))

            return { orders , count: counter[0].count  };
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

    async store(data: any ) {
        const { order } = data;
        if (!isOrderValid(order)) {
            throw "!ORDER INVALID!";
        }
        const { user, payment, purchase } = order;
        const { items, delivery, resume } = purchase;
        const { address } = payment;

        try {
            const order_db = { user_id: user.id, price: resume.total, address_id: address.id, created_at: convertToDatabaseDate(new Date()) };
            const order_id = (await insert('orders', order_db))[0];
            const n_items = items.map(item => ({
                ...item,
                order_id
            }))

            await itemService.stores(n_items);

            if (Number(delivery.code) === 1) {
                const dl = {
                    cep: delivery.cep,
                    code: delivery.code,
                    deadline: delivery.deadline,
                    name: delivery.name,
                    order_id,
                    store_id: delivery.store.id
                }
                await insert('delivery', dl);
            } else {
                await insert('delivery', { ...delivery, order_id });
            }

            await insert('order_resume', 
                { ...resume, order_id }
            );

            try {
                const trs = {
                    ...order,
                    purchase: {
                        ...purchase,
                        items: n_items
                    }
                };
                const transaction_id = await transactionService.store(trs);
                await update('orders', {
                    data: {
                        ...order_db,
                        transaction_id
                    },
                    conditions:[
                        ['id', '=', order_id]
                    ]
                })
                return;
            } catch (error) {
                throw `NOT POSSIBLE TO MAKE TRANSACTION ${error}`;
            }
        } catch (error) {
            throw `NOT POSSÍBLE TO SAVE ORDER ${error}`;
        }
    }

    async update() {

    }
}

export default OrderService;
