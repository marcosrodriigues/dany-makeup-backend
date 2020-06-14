import IProduct from '../interface/IProduct';
import { SERVER_IP } from '../config/info';
import connection from '../database/connection';

class ProductService {
    async findAll() {
        try {
            const products = await connection('products')
                .where('products.removed', false)
                .distinct()
                .select('products.*');
    
            const parsed_products = await Promise.all(products
                .map(async product => {
                    const categorys = await connection('categorys')
                        .join('category_product', 'category_product.category_id', 'categorys.id')
                        .where('category_product.product_id', product.id)
                        .distinct()
                        .select('categorys.*');
                    
                    const images = await connection('product_images')
                        .join('products', 'product_images.product_id', 'products.id')
                        .where('product_images.product_id', product.id)
                        .distinct()
                        .select('product_images.*');
                        
                    return {product, categorys, images};
                })
            );

            return parsed_products;
        } catch (err) {
            throw err;
        }
    }

    async findOne(id: number) {
        try {
            const product = await connection('products').where('id', id).select('*').first();

            const categorys = await connection('categorys')
                            .join('category_product', 'category_product.category_id', 'categorys.id')
                            .where('category_product.product_id', product.id)
                            .distinct()
                            .select('categorys.*');

            const images = await connection('product_images')
                            .join('products', 'product_images.product_id', 'products.id')
                            .where('product_images.product_id', product.id)
                            .distinct()
                            .select('product_images.*');

            return {product, categorys, images};
        } catch (err) {
            throw err;
        }
    }

    async store(product: IProduct, categorys: []) {
        try {
            const trx = await connection.transaction();

            const id = await trx('products').insert({
                name: product.name,
                shortDescription: product.shortDescription,
                fullDescription: product.fullDescription,
                amount: product.amount,
                available: Boolean(product.available),
                mainImage: product.mainImage,
                value: Number(product.value).toFixed(2),
            });

            const images = product.images
                .map(img => {
                    return {
                        product_id: id,
                        url: img
                    }
                });

            await trx('product_images').insert(images);

            const products_categorys = categorys
                .map((cat:string) => Number(cat.trim()))
                .map((cat_id:number) => {
                    return {
                        product_id: id,
                        category_id: cat_id
                    }
                })

            await trx('category_product').insert(products_categorys);

            trx.commit();

            const inserted = await connection('products').where('id','=',id).select('*').first();
            return inserted;
        } catch (err) {
            throw err;
        }
    }

    async update(product: IProduct, categorys: []) {
        if (!product.id) return undefined;

        console.log(product, categorys);

        try {
            const trx = await connection.transaction();

            await trx('product_images').where({product_id: product.id}).delete();
            await trx('category_product').where({product_id: product.id}).delete();

            const id = await trx('products').where('id', product.id).update({
                name: product.name,
                shortDescription: product.shortDescription,
                fullDescription: product.fullDescription,
                amount: product.amount,
                available: Boolean(product.available),
                mainImage: product.mainImage,
                value: Number(product.value).toFixed(2),
            })

            const images = product.images
                .map(img => {
                    return {
                        product_id: product.id,
                        url: img
                    }
            });

            await trx('product_images').insert(images);

            const products_categorys = categorys
                .map((cat:string) => Number(cat.trim()))
                .map((cat_id:number) => {
                    return {
                        product_id: product.id,
                        category_id: cat_id
                    }
                })

            await trx('category_product').insert(products_categorys);

            trx.commit();

            const updated = await connection('products').where('id','=',id).select('*').first();
            return updated;
        } catch (err) {
            console.log(err);
            throw err;
        }
    }

    async delete(id: number) {
        try {
            await connection('products').where('id', '=', id).update({ removed: true });
            return;
        } catch (err) {
            throw err;
        }
        
    }


    serializeImage(image: string) {
        return `${SERVER_IP}/uploads/${image}`;
    }
}

export default ProductService