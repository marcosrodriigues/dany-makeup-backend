import connection from '../database/connection';

class PromotionImagesService {
    async findByPromotion(id: number) {
        try {
            const images = await connection('promotion_images').where('promotion_id', id).select();
            return images;
        } catch (err) {
            throw err;
        }
    }
}

export default PromotionImagesService;