import connection from '../database/connection';
import ManufacturerService from './ManufacturerService';
import { buildConditions, select, count, insert, update, confirmRemove } from '../database/sqlBuilder';

const manufacturerService = new ManufacturerService();

class ProductService {
    async find(params = { filter: {}, pagination: {} }) {
        const { filter, pagination } = params;  

        const conditions = [['products.removed', '=', false]];
        const orConditions = buildConditions({ filter });
        const joins = [['manufacturers', 'manufacturers.id', 'products.manufacturer_id']]

        const options: any = {
            fields: ['products.*'],
            conditions,
            orConditions,
            joins,
            pagination
        }

        try {
            const result = await select('products', options);
            const counter = await count('products', options);

            const products = await Promise.all(result.map(async product => {
                const category_opt: any = {
                    fields: ['categorys.*'],
                    joins: [
                        ['category_product', 'category_product.category_id', 'categorys.id']
                    ],
                    conditions: [
                        ['category_product.product_id', '=', product.id]
                    ]
                }
                const categorys = await select('categorys', category_opt);

                const image_opt: any = {
                    fields: ['images.url'],
                    joins: [
                        ['products', 'products.id', 'product_images.product_id'],
                        ['images', 'images.id', 'product_images.image_id'],
                    ],
                    conditions: [
                        ['product_images.product_id', '=', product.id]
                    ]
                }

                const images = await select('product_images', image_opt);

                product.manufacturer = await manufacturerService.findOne(product.manufacturer_id)

                return { product, categorys, images }
            }))

            return {
                products,
                count: counter[0].count
            }
        } catch (err) {
            throw err;
        }
    }


    async findOne(id: number) {
        if (!id) throw "Product not provided"

        try {
            const product = (await select('products', {
                fields: [],
                conditions: [
                    ['id', '=', id]
                ]
            }))[0];

            const cat_opt: any = {
                fields: ['categorys.*'],
                joins: [
                    ['category_product', 'category_product.category_id', 'categorys.id']
                ],
                conditions: [
                    ['category_product.product_id', '=', product.id]
                ]
            }

            const categorys = await select('categorys', cat_opt);

            const img_opt: any = {
                fields: ['images.url'],
                joins: [
                    ['products', 'products.id', 'product_images.product_id'],
                    ['images', 'images.id', 'product_images.image_id']
                ],
                conditions: [
                    ['product_images.product_id', '=', product.id]
                ]
            };

            const images = await select('product_images', img_opt)

            const stock_opt : any = {
                fields: ['store_product.*', 'stores.name'],
                joins: [
                    ['stores', 'stores.id', 'store_product.store_id']
                ],
                conditions: [
                    ['store_product.product_id', '=', product.id]
                ]
            }

            const stock = await select('store_product', stock_opt)

            return { product, categorys, images, stock };
        } catch (err) {
            throw err;
        }
    }

    async store(data = { product: {}, images: [] as string[], categorys: [], stocks: [] }) {
        const { product, images, categorys, stocks } = data;

        try {
            const id = await insert('products', product);

            images.map(async img => {
                const obj = { url: img };
                const img_id = await insert('images', obj);

                const pi = {
                    image_id: img_id,
                    product_id: id[0]
                }
                await insert('product_images', pi);
            })

            categorys.map((cat: string) => Number(cat.trim()))
                .map(async (cat_id: number) => {
                    const cp = {
                        product_id: id[0],
                        category_id: cat_id
                    }
                    await insert('category_product', cp)
                })

            stocks.map(async (stock: any) => {
                const sp = {
                    product_id: id[0],
                    store_id: stock.store_id,
                    amount: stock.amount
                };
                await insert('store_product', sp)
            });

        } catch (err) {
            throw err;
        }
    }

    async updates(data = { product: {} as any, images: [], categorys: [], stocks: [] }) {
        const { product, images, categorys, stocks } = data;

        try {
            await update('products', {
                data: product,
                conditions: [
                    ['id', '=', product.id]
                ]
            });
            await confirmRemove('category_product', {
                conditions: [
                    ['product_id', '=', product.id]
                ]
            });
            await confirmRemove('product_images', {
                conditions: [
                    ['product_id', '=', product.id]
                ]
            });

            images.map(async img => {
                const obj = { url: img };
                const img_id = await insert('images', obj);

                const pi = {
                    image_id: img_id,
                    product_id: product.id
                }
                await insert('product_images', pi);
            })

            categorys.map((cat: string) => Number(cat.trim()))
                .map(async (cat_id: number) => {
                    const cp = {
                        product_id: product.id,
                        category_id: cat_id
                    }
                    await insert('category_product', cp)
                })


            stocks.map(async (stock: any) => {
                const sp = {
                    id: stock.id,
                    amount: stock.amount
                };
                await update('store_product', {
                    data: sp,
                    conditions: [
                        ['id', '=', stock.id]
                    ]
                })
            });
            
            return { message : 'success' }
        } catch (err) {
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
        const options: any = {
            fields: [],
            whereIn: [
                ['id', ids]
            ]
        }
        try {
            const products = await select('products', options);
            return products;
        } catch (err) {
            throw err;
        }
    }

    async findByCategoryAndSearch(data = { category_id: 0, search: '' }) {
        const { category_id, search } = data;
        const options: any = {
            fields: ['products.*'],
            conditions: [
                ['products.removed', '=', false]
            ]
        }

        if (category_id !== 0) {
            options.joins = [
                ['category_product', 'category_product.product_id', 'products.id']
            ]
        }

        if (search) {
            const filter = {
                name: search,
                short_description: search,
                full_description: search
            };

            options.orConditions = buildConditions({ filter });
        }
        
        try {
            const products = await select('products', options);
            return products
        } catch (err) {
            throw err;
        }
    }
}

export default ProductService