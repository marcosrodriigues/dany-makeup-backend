import { select } from '../database/sqlBuilder';

class ImagesService {
    async findByProduct(id: number) {
        const options: any = {
            fields: ['images.*'],
            joins: [
                ['images', 'images.id', 'product_images.image_id']
            ],
            conditions: [
                ['product_images.product_id', '=', id]
            ]
        }
        try {
            const images = await select('product_images', options)
            return images;
        } catch (err) {
            throw err;
        }
    }

    async existsByUrl(url: string) {
        const options: any = {
            fields: [],
            conditions: [
                ['url', '=', url]
            ]
        }
        try {
            const images = await select('images', options)
            return images.length > 0;
        } catch (err) {
            throw err;
        }
    }

    async findByPromotion(id: number) {
        const options: any = {
            fields: ['images.*'],
            joins: [
                ['images', 'images.id', 'promotion_images.image_id']
            ],
            conditions: [
                ['promotion_images.promotion_id', '=', id]
            ]
        }
        try {
            const images = await select('promotion_images', options)
            return images;
        } catch (err) {
            throw err;
        }
    }
}

export default ImagesService;