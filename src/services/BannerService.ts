import IBanner from "../interface/IBanner";
import connection from "../database/connection";
import { convertToDatabaseDate } from "../util/util";

class BannerService {
    async findAll(search = "", limit = 5, offset = 0) {
        try {
            var query = connection('banners').where({removed: false}).select('*')
            var queryCount = connection('banners').where({removed: false}).count('id', { as : 'count'});

            if (search !== "") {
                query.andWhere('name', 'like', `%${search}%`)
                queryCount.andWhere('name', 'like', `%${search}%`)

                query.orWhere('description', 'like', `%${search}%`)
                queryCount.orWhere('description', 'like', `%${search}%`)
            }

            query.limit(limit).offset(offset);

            const banners = await query;
            const counter = await queryCount;
    
            return { banners, count: counter[0].count  };
        } catch (err) {
            throw err;
        }
    }

    async findOne(id: number) {
        try {
            const banner = await connection('banners').where({ id, removed: false }).first();
            return banner;
        } catch (err) {
            throw err;
        }
    }

    async store(banner: IBanner) {
        try {
            await connection('banners').insert({
                name: banner.name,
                description: banner.description,
                start: convertToDatabaseDate(banner.start),
                end: convertToDatabaseDate(banner.end),
                image_url: banner.image_url
            });
            return true;
        } catch (err) {
            throw err;
        }
    }

    async update(banner: IBanner) {
        if (!banner.id) throw "No banner provided";
        
        try {
            await connection('banners').update({
                name: banner.name,
                description: banner.description,
                start: convertToDatabaseDate(banner.start),
                end: convertToDatabaseDate(banner.end),
                image_url: banner.image_url
            }).where('id', banner.id);
            return;
        } catch (err) {
            throw err;
        }
    }

    async delete(id: number) {
        try {
            await connection('banners').where({id}).update({removed: true});
            return;
        } catch (err) {
            throw err;
        }
    }
}

export default BannerService