import connection from '../database/connection';

class ProductImagesService {
    async findByProduct(id: number) {
        try {
            const images = await connection('product_images').where('product_id', id).select();
            return images;
        } catch (err) {
            throw err;
        }
    }
}

export default ProductImagesService;