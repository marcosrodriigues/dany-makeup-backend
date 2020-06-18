import IManufacturer from "../interface/IManufacturer";
import connection from '../database/connection';

class ManufacturerService {
    async findWithoutFilter() {
        try {
            const all = await connection('manufacturers').where('removed', false).select('*')
            return all;
        } catch (err) {
            throw err;
        }
    }

    async findOne(id: number) {
        if (id <= 0) return undefined;

        try {
            const manufacturer = await connection('manufacturers').where('id', id).first();
            return manufacturer;
        } catch (err) {
            throw err;
        }
        
    }

    async findAll(name = "", limit = 5, offset = 0) {
        var query = connection('manufacturers').select('*')
        var queryCount = connection('manufacturers').count('id', { as : 'count'});

        if (name !== "") {
            query.where('name', 'like', `%${name}%`);
            queryCount.where('name', 'like', `%${name}%`);
        }

        query.limit(limit).offset(offset);

        try {
            const manufacturers = await query;
            const counter = await queryCount;
    
            await Promise.all(manufacturers.map(async manufac => {
                manufac.qtd_produtos = await this.countProducts(manufac.id);
            }))
    
            return { manufacturers, count: counter[0].count  };
        } catch (err) {
            throw err;
        }
    }

    async store(manufacturer: IManufacturer) {
        try {
            const id = await connection('manufacturers').insert(manufacturer);
            return await connection('manufacturers').where('id', id).first('*');
        } catch (err) {
            throw err;
        }
    }

    async update(manufacturer: IManufacturer) {
        if (!manufacturer.id) return undefined;

        try {
            const id = await connection('manufacturers').where('id', manufacturer.id).update(manufacturer);
            return await connection('manufacturers').where('id', id).select('*');
        } catch (err) {
            throw err;
        }
    }

    async delete(id: number) {
        try {
            await connection('manufacturers').where('id', id).delete();
            return { status: 'deleted' };
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