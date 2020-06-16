import database from '../database/connection';
import ICategory from '../interface/ICategory';
import { SERVER_IP } from '../config/info';

class CategoryService {
    async findAll(available?: boolean) {
        const all = await database('categorys').select('*');
        return all;
    }

    async findOne(id: number) {
        const one = await database('categorys').where('id', '=', id).select('*').first();
        return one;
    }

    async store(category: ICategory) {
        const id = await database('categorys').insert(category);
        const saved = await database('categorys').where('id', '=', id).select('*');
        return saved;
    }

    async update(category: ICategory) {
        if (!category.id) return undefined;

        const saved = await database('categorys').where('id', '=', category.id).update(category);
        return saved;
    }

    async delete(category_id: number) {
        await database('categorys').where('id', '=', category_id).delete();
        return;
    }

    serialize(category: ICategory) {
        return {
            ...category,
            image_url: `${SERVER_IP}/uploads/${category.image_url}`
        };
    }
}

export default CategoryService;