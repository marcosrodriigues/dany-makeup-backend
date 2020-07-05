import database from '../database/connection';
import connection from '../database/connection';
import { convertToDatabaseDate } from '../util/util';
import { buildConditions, select, count, insert, update, confirmRemove } from '../database/sqlBuilder';

class PromotionService {

    async find(params = { filter: {}, pagination: {} }) {
        const { filter, pagination } = params;

        const conditions = [
            ['promotions.removed', '=', false]
        ];
        const orConditions = buildConditions({filter});
        const leftJoins = [
            ['promotion_product' ,'promotion_product.promotion_id', 'promotions.id'],
            ['products', 'products.id', 'promotion_product.product_id']
        ]

        console.log('filtr', filter,'or', orConditions);

        const options: any = {
            fields: [],
            conditions,
            orConditions,
            leftJoins,
            pagination
        }

        try {
            const result = await select('promotions', options);
            const counter = await count('promotions', options);

            const promotions = await Promise.all(result.map(async promotion => {
                const products = await select('products', {
                    fields: [],
                    joins: [
                        ['promotion_product', 'promotion_product.product_id', 'products.id']
                    ],
                    conditions: [
                        ['promotion_product.promotion_id', '=', promotion.id]
                    ]
                });

                return { promotion, products }
            }));

            return { promotions, count: counter[0].count}
        } catch (err) {
            throw err;
        }
    } 
    async findWithoutFilter() {
        try {
            const all = await database('promotions')
                .where('removed', false)
                .select('*')
            return all;
        } catch (err) {
            throw err;
        }
    }

    async findOne(id: number) {
        if (id === 0) throw "Promotion not provided"
        try {
            const promotion = (await select('promotions', {
                fields: [],
                conditions: [
                    ['id', '=', id]
                ]
            }))[0]

            const products = await select('products', {
                fields: [],
                joins:[
                    ['promotion_product', 'promotion_product.product_id', 'products.id']
                ],
                conditions: [
                    ['promotion_product.promotion_id', '=', promotion.id]
                ]
            })

            const images = await select('images', {
                fields: [],
                joins: [
                    ['promotion_images', 'promotion_images.image_id', 'images.id']
                ],
                conditions: [
                    ['promotion_images.promotion_id', '=', promotion.id]
                ]
            })

            return {promotion, products, images};
        } catch (err) {
            throw err;
        }
    }

    async store(data = { promotion: {}, products: [], images: []}) {
        const { promotion, products, images } = data;

        promotion.start = convertToDatabaseDate(promotion.start)
        promotion.end = convertToDatabaseDate(promotion.end);

        try {
            const id = await insert('promotions', promotion);

            images.map(async img => {
                const obj = { url: img };
                const img_id = await insert('images', obj);

                const pi = {
                    image_id: img_id,
                    promotion_id: id[0]
                }
                await insert('promotion_images', pi);
            })

            products.split(',').map(async prod_id => {
                    const pp = {
                        product_id: prod_id,
                        promotion_id: id[0]
                    }

                    await insert('promotion_product', pp);
                });
        } catch (err) {
            throw err;
        }
        return;
    }

    async update(data = { promotion: {}, products: [], images: []}) {
        const { promotion, products, images } = data;
        if (!promotion.id) throw "No promotion provided";

        promotion.start = convertToDatabaseDate(promotion.start)
        promotion.end = convertToDatabaseDate(promotion.end);

        try {
            await update('promotions', {
                data: promotion,
                conditions: [
                    ['id', '=', promotion.id]
                ]
            });
            await confirmRemove('promotion_images', {
                conditions: [
                    ['promotion_id', '=', promotion.id]
                ]
            });
            await confirmRemove('promotion_product', {
                conditions: [
                    ['promotion_id', '=', promotion.id]
                ]
            });


            images.map(async img => {
                const obj = { url: img };
                const img_id = await insert('images', obj);

                const pi = {
                    image_id: img_id,
                    promotion_id: promotion.id
                }
                await insert('promotion_images', pi);
            })

            products.split(',').map(async prod_id => {
                const pp = {
                    product_id: prod_id,
                    promotion_id: promotion.id
                }

                await insert('promotion_product', pp);
            });
        } catch (err) {
            throw err;
        }
    }

    async delete(id: number) {
        try {
            await connection('promotions').where('id', '=', id).update({ removed: true });
            return;
        } catch (err) {
            throw err;
        }
    }
    async findAvailables() {
        try {
            const promotions = await connection('promotions')
                .where({ removed: false })
                .andWhere('start', '<=', new Date())
                .andWhere('end', '>=', new Date())
                .distinct()
                .select('*')
                .orderBy('id', 'desc')
            return promotions;
        } catch (err) {
            throw err;
        }
    }
}

export default PromotionService;