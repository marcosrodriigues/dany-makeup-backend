import database from '../database/connection';
import ICategory from '../interface/ICategory';
import { SERVER_IP } from '../config/info';

class CategoryService {
    async findWithoutFilter() {
        const all = await database('categorys').where('removed', false).select('*')
        return all;
    }

    async findAll(title = "", limit = 5, offset = 0) {
        var query = database('categorys').select('*').where('removed', false)
        var queryCount = database('categorys').count('id', { as : 'count'});

        if (title !== "") {
            query.andWhere('title', 'like', `%${title}%`);
            queryCount.andWhere('title', 'like', `%${title}%`);
        }

        query.limit(limit).offset(offset);

        const categorys = await query;
        const counter = await queryCount;

        await Promise.all(categorys.map(async cat => {
            cat.qtd_produtos = await this.countProducts(cat.id);
        }))

        return { categorys, count: counter[0].count  };
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

    async countProducts(id: number) {
        var record = await database('categorys')
            .join('category_product', 'category_product.category_id', 'categorys.id')
            .where('categorys.id', id)
            .count('category_product.id', { as : 'count' })

        return record[0].count;;
    }
}

export default CategoryService;