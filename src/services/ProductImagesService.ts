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

    async existsByUrl(url: string) {
        try {
            const exists = await connection('product_images').where('url', url).first('id');
            return exists !== undefined;
        } catch (err) {
            throw err;
        }
    }
}

export default ProductImagesService;