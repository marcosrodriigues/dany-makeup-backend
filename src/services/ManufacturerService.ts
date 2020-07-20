import connection from '../database/connection';
import { buildConditions, select, count, insert, update, remove } from "../database/sqlBuilder";

class ManufacturerService {
    async find(params = { filter: { }, pagination: {} }) {
        const { filter, pagination } = params;
        
        const conditions = buildConditions({ filter });

        try {
            const options: any  = {
                fields: ['*'],
                conditions: conditions,
                pagination: pagination
            }
            const result = await select('manufacturers', options);
            const counter = await count('manufacturers', options);

            await Promise.all(result.map(async manufac => {
                manufac.qtd_produtos = await this.countProducts(manufac.id);
            }))

            return { manufacturers: result , count: counter[0].count  };
        } catch (err) {
            throw err;
        }
    }

    async findOne(id: number) {
        if (id <= 0) return undefined;

        try {
            const manufacturer = (await select('manufacturers', {
                fields: [],
                conditions: [['id', '=', id]]
            }))[0];
            return manufacturer;
        } catch (err) {
            throw err;
        }
        
    }
    
    async store(data = { manufacturer: {}}) {
        const { manufacturer } = data;
        try {
            const insertedIds = await insert('manufacturers', manufacturer);
            return insertedIds;
        } catch (err) {
            throw err;
        }
    }

    async update(data = { manufacturer: {}}) {
        const { manufacturer } = data;

        try {
            await update('manufacturers', {
                data: manufacturer,
                conditions:[[
                    'id', '=', manufacturer.id
                ]]
            })
            return { message: 'success'}
        } catch (err) {
            throw err;
        }
    }

    async delete(id: number) {
        if (id === 0) return;

        try {
            await remove('manufacturers', {
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
        var record = await connection('manufacturers')
            .join('products', 'products.manufacturer_id', 'manufacturers.id')
            .where('manufacturers.id', id)
            .where('products.removed', false)
            .count('products.id', { as : 'count' })

        return record[0].count;;
    }
}

export default ManufacturerService;