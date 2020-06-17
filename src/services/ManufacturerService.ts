import IManufacturer from "../interface/IManufacturer";
import connection from '../database/connection';

class ManufacturerService {
    async findOne(id: number) {
        if (id <= 0) return undefined;

        const manufacturer = await connection('manufacturers').where('id', id).first();
        return manufacturer;
    }

    async findAll(name = "", limit = 10, offset = 0) {
        var query = connection('manufacturers').select('*')
        var queryCount = connection('manufacturers').count('id', { as : 'count'});

        if (name !== "") {
            query.where('name', 'like', `%${name}%`);
            queryCount.where('name', 'like', `%${name}%`);
        }

        query.limit(limit).offset(offset);

        const manufacturers = await query;
        const counter = await queryCount;

        return { manufacturers, count: counter[0].count  };
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
}

export default ManufacturerService;