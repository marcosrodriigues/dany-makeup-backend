import { select } from "../database/sqlBuilder";

class DeliveryService {
    async findByOrder(order_id: number) {
        if (!order_id) throw "No Order provided";

        try {
            const delivery = (await select('delivery', {
                fields: [],
                conditions: [
                    ['order_id', '=', order_id]
                ]
            }))[0];
            return delivery;
        } catch (error) {
            throw error;
        }
    }
}

export default DeliveryService;