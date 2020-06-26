import IProduct from '../interface/IProduct';
import connection from '../database/connection';
import ManufacturerService from './ManufacturerService';

const manufacturerService = new ManufacturerService();

class ProductService {
    async findAll(input = "", limit = 5, offset = 0) {
        try {
            const query = connection('products')
                .join('manufacturers', 'manufacturers.id', 'products.manufacturer_id')
                .where('products.removed', false)
                .distinct()
                .select(['products.*'])

            const queryCount = connection('products')
                .join('manufacturers', 'manufacturers.id', 'products.manufacturer_id')
                .where('products.removed', false)
                .distinct()
                .count('products.id', { as : 'count' })

            if(input !== "") {
                query.andWhere(function() {
                    this.where('products.name', 'like', `%${input}%`)
                    .orWhere('shortDescription', 'like', `%${input}%`)
                    .orWhere('fullDescription', 'like', `%${input}%`);
                })
                queryCount.andWhere(function() {
                    this.where('products.name', 'like', `%${input}%`)
                    .orWhere('shortDescription', 'like', `%${input}%`)
                    .orWhere('fullDescription', 'like', `%${input}%`);
                })
            }

            query.limit(limit).offset(offset);

            const filteredProducts = await query;
            const counter = await queryCount;
    
            const products = await Promise.all(filteredProducts
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

                    const manufacturer = await manufacturerService.findOne(product.manufacturer_id);
                    product.manufacturer = manufacturer;
                        
                    return {product, categorys, images};
                })
            );

            return { products, count: counter[0].count };
        } catch (err) {
            throw err;
        }
    }

    async findOne(id: number) {
        if (!id) throw "Product not provided"

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
                manufacturer_id: product.manufacturer.id
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
        if (!product.id) throw "No product provided";

        try {
            const trx = await connection.transaction();

            await trx('product_images').where({product_id: product.id}).delete();
            await trx('category_product').where({product_id: product.id}).delete();

            await trx('products').where('id', product.id).update({
                name: product.name,
                shortDescription: product.shortDescription,
                fullDescription: product.fullDescription,
                amount: product.amount,
                available: Boolean(product.available),
                mainImage: product.mainImage,
                value: Number(product.value).toFixed(2),
                manufacturer_id: product.manufacturer.id
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

            const updated = this.findOne(product.id);
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

    async findInIdsWithoutFilter(ids: number[]) {
        try {
            const all = await connection('products').whereIn('id', ids).select('*');
            return all;
        } catch (err) {
            throw err;
        }
    }

    async findByCategoryAndSearch(category_id = 0, search = '') {
        const query = connection('products')
            .where('products.removed', false);
        
        if (search !== '') {
            query.andWhere(function () {
                this.where('name', 'like', `%${search}%`)
                    .orWhere('shortDescription', 'like', `%${search}%`)
                    .orWhere('fullDescription', 'like', `%${search}%`)
            })
        }

        if (category_id !== 0) {
            query.join('category_product', 'category_product.product_id', 'products.id')
                .andWhere('category_id', category_id)
        }

        try {
            const products = await query.select('products.*');
            return products
        } catch (err) {
            throw err;
        }
    }
}

export default ProductService