import ProductService from './ProductService';
import connection from '../database/connection';
import { insert, select } from '../database/sqlBuilder';

const productService = new ProductService();

class ItemService {
    async store(data: any) {
        if (data.type === 'PRODUCT') {
            data.product_id = data.id;
            let product = await productService.onlyProduct(data.product_id);
            product.amount = product.amount - data.quantity;
            await productService.save(product);
        }

        const foreign = 
            data.type === 'PROMOTION' ? {
                promotion_id: data.id
            } : {
                product_id: data.id
            }

        const item = {
            name: data.name,
            type: data.type,
            image_url: data.image_url,
            order_id: data.order_id,
            quantity: data.quantity,
            description: data.description || '',
            unit_price: data.value,
            ...foreign
        }

        try {
            const id = (await insert('items', item))[0];
            return id;
        } catch (error) {
            throw error;
        }
    }

    async stores (data:any[]) {
        try {
            await Promise.all(data.map(async d => await this.store(d)))
        } catch (err) {
            throw err;
        }
    }

    async findByOrder(order_id: number) {
        if (order_id === 0) throw 'NO ORDER PROVIDED';

        try {
            const items = await select('items', {
                fields: [],
                conditions: [
                    ['order_id', '=', order_id]
                ]
            })

            return items;
        } catch (err) {
            throw err;
        }
    }
}

export default ItemService;