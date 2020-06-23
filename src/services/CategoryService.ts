import database from '../database/connection';
import ICategory from '../interface/ICategory';
import { SERVER_IP } from '../config/info';

class CategoryService {
    async findWithoutFilter() {
        try {
            const all = await database('categorys').where('removed', false).select('*')
            return all;
        } catch (err) {
            throw err;
        }
    }

    async findAll(title = "", limit = 5, offset = 0) {
        var query = database('categorys').select('*').where('removed', false)
        var queryCount = database('categorys').count('id', { as : 'count'});

        if (title !== "") {
            query.andWhere('title', 'like', `%${title}%`);
            queryCount.andWhere('title', 'like', `%${title}%`);
        }

        query.limit(limit).offset(offset);

        try {
            const categorys = await query;
            const counter = await queryCount;
    
            await Promise.all(categorys.map(async cat => {
                cat.qtd_produtos = await this.countProducts(cat.id);
            }))
    
            return { categorys, count: counter[0].count  };
        } catch (err) {
            throw err;
        }
    }

    async findOne(id: number) {
        const one = await database('categorys').where('id', '=', id).select('*').first();
        return one;
    }

    async store(category: ICategory) {
        try {
            const id = await database('categorys').insert(category);
            const saved = await database('categorys').where('id', '=', id).select('*');
            return saved;
        } catch (err) {
            throw err;
        }
        
    }

    async update(category: ICategory) {
        try {
            if (!category.id) return undefined;
    
            const saved = await database('categorys').where('id', '=', category.id).update(category);
            return saved;
        } catch (err) {
            throw err;
        }
    }

    async delete(category_id: number) {
        try {
            await database('categorys').where('id', '=', category_id).delete();
            return;
        } catch (err) {
            throw err;
        }
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
            .join('products', 'products.id', 'category_product.product_id')
            .where('categorys.id', id)
            .where('products.removed', false)
            .distinct()
            .count('category_product.id', { as : 'count' })

        return record[0].count;;
    }

    async findWithProduct() {
        var query = database('categorys')
            .join('category_product', 'category_product.category_id', 'categorys.id')
            .join('products', 'products.id', 'category_product.product_id')
            .where('categorys.removed', false)
            .where('products.removed', false)
            .count('products.id', { as: 'counter'})
            .having('counter', ">", 0)
            .groupBy('categorys.id')
            .distinct()
            .select(['categorys.*'])

        try {
            const categorys = await query;

            return categorys;
        } catch (err) {
            throw err;
        }
    }

    async findProducts(category_id: number) {
        var query = database('category_product')
            .join('products', 'products.id', 'category_product.product_id')
            .where('products.removed', false)
            .where('category_product.category_id', category_id)
            .select("products.*");

        try {
            const products = await query;

            console.log(products);

            return products;
        } catch (err) {
            console.log("Error service category - findProducts")
            throw err;
        }
    }
}


export default CategoryService;