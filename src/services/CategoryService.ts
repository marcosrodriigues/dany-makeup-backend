import database from '../database/connection';
import { buildConditions, select, count, insert, update, remove } from '../database/sqlBuilder';

class CategoryService {
    async find(params = { filter: { }, pagination: {} }) {
        const { filter, pagination } = params;

        const conditions = buildConditions({ filter });

        try {
            const options: any  = {
                fields: ['*'],
                conditions: conditions,
                pagination: pagination
            }
    
            const result = await select('categorys', options);
            const counter = await count('categorys', options);

            await Promise.all(result.map(async cat => {
                cat.qtd_produtos = await this.countProducts(cat.id);
            }))
    
            return { categorys: result, count: counter[0].count  };
        } catch (err) {
            throw err;
        }
    }

    async findOne(id: number) {
        if (id <= 0) return undefined;

        try {
            const category = (await select('categorys', {
                fields: [],
                conditions: [['id', '=', id]]
            }))[0];
            return category;
        } catch (err) {
            throw err;
        }
        
    }

    async store(data = { category: {} }) {
        const { category } = data;
        try {
            await insert('categorys', category);
            return { message: 'success' };
        } catch (err) {
            throw err;
        }
        
    }

    async update(data = { category: { } as any }) {
        const { category } = data;
        try {
            await update('categorys', {
                data: category,
                conditions: [[
                    'id', '=', category.id
                ]]
            })
            return { message: 'success' };
        } catch (err) {
            throw err;
        }
    }

    async delete(id: number) {
        if (id === 0) throw "No category provided";
        
        try {
            await remove('categorys', {
                conditions: [
                    ['id', '=', id]
                ]
            });
            return { message: 'success' };
        } catch (err) {
            throw err;
        }
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

            return products;
        } catch (err) {
            console.log("Error service category - findProducts")
            throw err;
        }
    }
}


export default CategoryService;