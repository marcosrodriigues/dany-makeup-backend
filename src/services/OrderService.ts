import { buildConditions, count, select, insert, update } from "../database/sqlBuilder";
import { isOrderValid, convertToDatabaseDate } from "../util/util";
import ItemService from './ItemService'
import TransactionService from "./TransactionService";
import ResumeService from "./ResumeService";
import DeliveryService from "./DeliveryService";
import AddressService from "./AddressService";
import StoreService from "./StoreService";
import UserService from "./UserService";

const itemService = new ItemService();
const transactionService = new TransactionService();
const resumeService = new ResumeService();
const deliveryService = new DeliveryService();
const addressService = new AddressService();
const storeService = new StoreService();
const userService = new UserService()
class OrderService {
    async find(params = { filter: { }, pagination: {} }) {
        const { filter, pagination } = params;
        
        const conditions = buildConditions({ filter });

        try {
            const options: any  = {
                fields: [],
                conditions,
                pagination,
                orderBy: [['id', 'desc']],
                joins: [
                    ['items', 'items.order_id', 'orders.id'],
                    ['users', 'orders.user_id', 'users.id'],
                ],
                leftJoins: [
                    ['transactions', 'transactions.id', 'orders.transaction_id']
                ]
            }
            const result = await select('orders', options);
            const counter = await count('orders', options);

            const orders = await Promise.all(result.map(async ord => {
                ord.items = await itemService.findByOrder(ord.id);
                ord.transaction = await transactionService.findById(ord.transaction_id)
                const { user } = await userService.findOne(ord.user_id);
                ord.user = user;
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

            order.items = await itemService.findByOrder(order.id);
            order.transaction = await transactionService.findById(order.transaction_id)
            order.resume = await resumeService.findByOrder(order.id);
            order.delivery = await deliveryService.findByOrder(order.id);
            order.address = await addressService.findOne(order.address_id);
            const { user } = await userService.findOne(order.user_id);
            order.user = user;

            if(order.delivery && order.delivery.store_id !== null)
                order.delivery.store = await storeService.findOne(order.delivery.store_id);

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

        const order_db = { user_id: user.id, price: resume.total, address_id: address.id, created_at: convertToDatabaseDate(new Date()) };
        let order_id: number = 0;

        try {
            order_id = (await insert('orders', order_db))[0];
        } catch (error) {
            console.log('ERROR SAVING ORDER', error);
            throw error;
        }

        let n_items: any = items.map(item => ({
            ...item,
            order_id
        }));

        try {
            await itemService.stores(n_items);
        } catch (error) {
            console.log('ERROR SAVING ITEMS', error);
            throw error;
        }

        try {
            if (Number(delivery.code) === 1) { //entrega em maos
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
        } catch (error) {
            console.log('ERROR SAVING DELIVERY', error)
            throw error;
        }

        try {
            await insert('order_resume', 
                { ...resume, order_id }
            );
        } catch (error) {
            console.log('ERROR SAVING RESUME', error);
            throw error;
        }

        let transaction_id = 0;
        try {
            const trs = {
                ...order,
                purchase: {
                    ...purchase,
                    items: n_items
                }
            };
            transaction_id = await transactionService.store(trs);
        } catch (error) {
            console.log("ERROR MAKE TRANSACTION", error);
            throw `NOT POSSIBLE TO MAKE TRANSACTION ${error.response}`;
        }

        try {
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
            console.log('ERROR UPDATE ORDER WITH TRANSACTION', error)
            throw error;
        }
    }
}

export default OrderService;
