import connection from "../database/connection";
import { convertToDatabaseDate } from "../util/util";
import { buildConditions, select, count, insert, update, remove } from "../database/sqlBuilder";

class BannerService {
    async find(params = { filter: { }, pagination: {} }) {
        const { filter, pagination } = params;
        
        const conditions = buildConditions({ filter });

        try {
            const options: any  = {
                fields: ['*'],
                conditions: conditions,
                pagination: pagination
            }
            const result = await select('banners', options);
            const counter = await count('banners', options);

            return { banners: result , count: counter[0].count  };
        } catch (err) {
            throw err;
        }
    }

    async findOne(id: number) {
        if (id === 0) throw "Banner not provided";

        try {
            const banner = (await select('banners', {
                fields: [],
                conditions: [['id', '=', id]]
            }))[0];

            return banner;
        } catch (err) {
            throw err;
        }
    }

    async findAvailables() {
        try {
            const banners = await connection('banners')
                .where({ removed: false })
                .andWhere('start', '<=', new Date())
                .andWhere('end', '>=', new Date())
                .distinct()
                .select('*')
                .orderBy('end', 'asc')
            return banners;
        } catch (err) {
            throw err;
        }
    }

    async store(data = { banner: {} as any }) {
        const { banner } = data;
        try {
            await insert('banners', {
                ...banner,
                start: convertToDatabaseDate(banner.start),
                end: convertToDatabaseDate(banner.end)
            });
            return { message: 'success' };
        } catch (err) {
            throw err;
        }
    }

    async update(data = { banner: {} as any }) {
        const { banner } = data;
        
        try {
            await update('banners', {
                data: {
                    ...banner,
                    start: convertToDatabaseDate(banner.start),
                    end: convertToDatabaseDate(banner.end)
                },
                conditions: [
                    ['id', '=', banner.id]
                ]
            });
            return { message: 'success' };
        } catch (err) {
            throw err;
        }
    }

    async delete(id: number) {
        if (id === 0) return;

        try {
            await remove('banners', {
                conditions: [
                    ['id', '=', id]
                ]
            });
            return { message: 'success' };
        } catch (err) {
            throw err;
        }
    }
}

export default BannerService