import ProductService from './ProductService';
import connection from '../database/connection';

const productService = new ProductService();

class ItemService {
    async store(data: any) {
        if (data.type === 'PROMOTIONS') {
            data.promotion_id = data.id;
        } else if (data.type === 'PRODUCTS') {
            data.product_id = data.id;
            const { product, images, categorys, stock } = await productService.findOne(data.product_id);
            product.amount = product.amount - data.quantity;
//            await productService.updates({ product, images, categorys, stocks: stock });
        }

        const foreign = 
            data.type === 'PROMOTIONS' ? {
                promotion_id: data.id
            } : {
                product_id: data.id
            }

        const item = {
            name: data.name,
            type: data.type,
            quantity: data.quantity,
            description: data.description || '',
            unit_price: data.value,
            ...foreign
        }

        console.log(item)

        try {
            const trx = connection.transaction();

        } catch (error) {
            throw error;
        }
    }
}

export default ItemService;