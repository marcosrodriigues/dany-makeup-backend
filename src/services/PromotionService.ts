import database from '../database/connection';
import IPromotion from '../interface/IPromotion'
import connection from '../database/connection';
import { convertToDatabaseDate } from '../util/util';

class PromotionService {
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
                .join('promotion_product', 'promotion_product.promotion_id', 'promotions.id')
                .join('products', 'products.id', 'promotion_product.product_id')
                .where('promotions.removed', false)
                .distinct()
                .select('promotions.*')

            const queryCount = database('promotions')
                .join('promotion_product', 'promotion_product.promotion_id', 'promotions.id')
                .join('products', 'products.id', 'promotion_product.product_id')
                .where('promotions.removed', false)
                .distinct()
                .count('promotions.id', { as: 'count' })

            if (input !== "") {
                query.andWhere('promotions.name', 'like', `%${input}%`)
                queryCount.andWhere('promotions.name', 'like', `%${input}%`)

                query.orWhere('products.name', 'like', `%${input}%`)
                queryCount.orWhere('products.name', 'like', `%${input}%`)
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
        const one = await database('promotions').where('id', '=', id).select('*').first();
        return one;
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

    async delete(id: number) {
        try {
            await connection('promotions').where('id', '=', id).update({ removed: true });
            return;
        } catch (err) {
            throw err;
        }
    }
}

export default PromotionService;