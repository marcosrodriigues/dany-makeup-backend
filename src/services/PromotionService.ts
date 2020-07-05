import database from '../database/connection';
import IPromotion from '../interface/IPromotion'
import connection from '../database/connection';
import { convertToDatabaseDate } from '../util/util';
import { buildConditions, select, count } from '../database/sqlBuilder';

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

    async findAll(input = "", limit = 5, offset = 0) {
        try {
            const query = database('promotions')
                .leftJoin('promotion_product', 'promotion_product.promotion_id', 'promotions.id')
                .leftJoin('products', 'products.id', 'promotion_product.product_id')
                .where('promotions.removed', false)
                .distinct()
                .select('promotions.*')

            const queryCount = database('promotions')
                .leftJoin('promotion_product', 'promotion_product.promotion_id', 'promotions.id')
                .leftJoin('products', 'products.id', 'promotion_product.product_id')
                .where('promotions.removed', false)
                .distinct()
                .countDistinct('promotions.id', { as: 'count' })

            if (input !== "") {
                query.andWhere(function () {
                    this.where('promotions.name', 'like', `%${input}%`)
                    .orWhere('products.name', 'like', `%${input}%`)
                });
                queryCount.andWhere(function () {
                    this.where('promotions.name', 'like', `%${input}%`)
                    .orWhere('products.name', 'like', `%${input}%`)
                });
            }

            query.limit(limit).offset(offset);
            const filtered = await query;
            const counter = await queryCount;
            
            const promotions = await Promise.all(filtered
                .map(async promotion => {
                    const products = await database('products')
                        .join('promotion_product', 'promotion_product.product_id', 'products.id')
                        .where('promotion_product.promotion_id', promotion.id)
                        .distinct()
                        .select('products.*');

                    return {promotion, products}
                }));

            return { promotions, count: counter[0].count }

        } catch (err) {
            console.log(err);
            throw err;
        }
    }

    async findOne(id: number) {
        try {
            const promotion = await connection('promotions').where('id', id).select('*').first();

            const products = await connection('products')
                            .join('promotion_product', 'promotion_product.product_id', 'products.id')
                            .where('promotion_product.promotion_id', promotion.id)
                            .distinct()
                            .select('products.*');

            const images = await connection('promotion_images')
                            .join('promotions', 'promotion_images.promotion_id', 'promotions.id')
                            .where('promotion_images.promotion_id', promotion.id)
                            .distinct()
                            .select('promotion_images.*');

            return {promotion, products, images};
        } catch (err) {
            throw err;
        }
    }

    async store(promotion: IPromotion) {
        try {
            const trx = await connection.transaction();

            const id = await trx('promotions').insert({
                name: promotion.name,
                start: convertToDatabaseDate(promotion.start),
                end: convertToDatabaseDate(promotion.end),
                originalValue: promotion.originalValue,
                discountType: promotion.discountType,
                discount: promotion.discount,
                promotionValue: promotion.promotionValue,
                mainImage: promotion.mainImage,
            });

            const images = promotion.images
                .map(img => {
                    return {
                        promotion_id: id,
                        url: img
                    }
                })

            await trx('promotion_images').insert(images);

            const promotion_products = promotion.products
                .map(prod => {
                    return {
                        product_id: prod.id,
                        promotion_id: id
                    }
                });

            await trx('promotion_product').insert(promotion_products);

            await trx.commit();

            const inserted = await connection('promotions').where('id','=',id).select('*').first();
            return inserted;
        } catch (err) {
            throw err;
        }
    }

    async update(promotion: IPromotion) {
        if (!promotion.id) throw "No promotion provided";

        try {
            const trx = await connection.transaction();

            await trx('promotion_images').where('promotion_id', promotion.id).delete();
            await trx('promotion_product').where('promotion_id', promotion.id).delete();

            await trx('promotions').where('id', promotion.id).update({
                name: promotion.name,
                start: convertToDatabaseDate(promotion.start),
                end: convertToDatabaseDate(promotion.end),
                originalValue: promotion.originalValue,
                discountType: promotion.discountType,
                discount: promotion.discount,
                promotionValue: promotion.promotionValue,
                mainImage: promotion.mainImage,
            })

            const images = promotion.images
                .map(img => {
                    return {
                        promotion_id: promotion.id,
                        url: img
                    }
                })

            const promotion_products = promotion.products
                .map(prod => {
                    return {
                        product_id: prod.id,
                        promotion_id: promotion.id
                    }
                });

            await trx('promotion_images').insert(images);
            await trx('promotion_product').insert(promotion_products);
            await trx.commit();

            const updated = this.findOne(promotion.id);
            return updated;
        } catch (err) {
            console.log(err)
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