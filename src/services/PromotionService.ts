import database from '../database/connection';
import IPromotion from '../interface/IPromotion'
import connection from '../database/connection';
import { convertToDatabaseDate } from '../util/util';

class PromotionService {
    async findWithoutFilter() {
        try {
            const all = await database('promotions').where('removed', false).select('*')
            return all;
        } catch (err) {
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
                .map(prod => prod.id)
                .map(prodId => {
                    return {
                        product_id: prodId,
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
}

export default PromotionService;