import { Response, Request } from "express";
import OrderService from "../services/OrderService";
import { isOrderValid } from "../util/util";

const service = new OrderService();

class OrderController {
    async index(request: Request, response: Response) {
        const {
            page = 1,
            limit = 5
        } = request.query;

        const offset = Number(limit) * (Number(page) - 1);

        const options = {
            filter: { },
            pagination: {
                limit,
                offset
            }
        }

        try {
            const { orders, count } = await service.find(options);

            response.setHeader("x-total-count", Number(count));
            response.setHeader("Access-Control-Expose-Headers", "x-total-count");
            return response.json(orders);
        } catch (error) {
            console.log("ERROR ORDER CONTROLLER - INDEX\n");
            return response.status(400).json({ error })   
        }
    }

    async byUser(request: Request, response: Response) {
        const { user_id } = request.params;
        const {
            page = 1,
            limit = 5
        } = request.query;

        const offset = Number(limit) * (Number(page) - 1);


        const options = {
            filter: {
                user_id
            },
            pagination: {
                limit,
                offset
            }
        }

        try {
            const { orders } = await service.find(options);
            return response.json(orders);
        } catch (error) {
            console.log("ERROR ORDER CONTROLLER - BYUSER\n");
            return response.status(400).json({ error })   
        }
    }

    async show(request: Request, response: Response) {
        const { id } = request.params;

        try {   
            const order = service.findOne(Number(id));
            return response.json(order);
        } catch (error) {
            console.log("ERROR ORDER CONTROLLER - SHOW\n");
            return response.status(400).json({ error })   
        }
    }
    async store(request: Request, response: Response) { 
        const { order } = request.body;
        try {
            await service.store({ order });

            return response.json({ message: 'success' })
        } catch (error) {
            console.log('error store order', error)
            return response.status(400).json({ error });
        }

    }
    async update(request: Request, response: Response) { }
    async delete(request: Request, response: Response) { }
}

export default OrderController;
