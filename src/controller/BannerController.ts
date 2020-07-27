import { Request, Response } from "express";
import FileService from "../services/FileService";
import BannerService from "../services/BannerService";

const fileService = new FileService();
const service = new BannerService();

class BannerController {
    async index(request: Request, response: Response ) {
        const {
            name = "",
            page = 1,
            limit = 5
        } = request.query;

        const offset = Number(limit) * (Number(page) - 1);

        const options = {
            filter: {
                name: String(name),
                description: String(name)
            },
            pagination: {
                limit: limit,
                offset: offset
            }
        }

        try {
            const { banners, count } = await service.find(options);

            response.setHeader("x-total-count", Number(count));
            response.setHeader("Access-Control-Expose-Headers", "x-total-count");
            return response.json(banners);
        } catch (err) {
            console.log("ERROR PROMOTION CONTROLLER - INDEX\n");
            return response.status(400).json({ error: err })   
        }
    }

    async show(request: Request, response: Response ) { 
        const { id } = request.params;

        if (!id) return response.status(400).json({ message: 'No banner provided' })

        try {
            const one = await service.findOne(Number(id));
            return response.json(one);
        } catch (err) {
            console.log("erro show banner controller", err)
            return response.status(400).json({ error: err });
         }
    }

    async available(request: Request, response: Response ) { 
        try {
            const availables = await service.findAvailables();
            return response.json(availables);
        } catch (err) {
            console.log("erro show banner controller", err)
            return response.status(400).json({ error: err });
         }
    }

    async store(request: Request, response: Response ) { 
        const {
            name,
            description,
            start,
            end
        } = request.body;
        const { file } = request;

        if (!file) return response.status(400).json({error: 'No file provided!'});

        const image_url = await fileService.serializeImageUrl(file.filename, 'banners');

        const banner = {
            name,
            description,
            start,
            end,
            image_url
        }

        try {
            await service.store({ banner });
            return response.json({ status: 'success' })
        } catch (err) {
            console.log('ERROR BANNER CONTROLE - STORE', err);
            return response.json({ error: err })
        }
    }

    async update(request: Request, response: Response ) { 
        const {
            id,
            name,
            description,
            start,
            end,
            image_url
        } = request.body;
        const { file } = request;

        if (!id) return response.status(400).json({ error: 'No banner provided! '});

        let data : any = { id, name, description, start, end, image_url };

        const banner = await fileService
            .deleteFileAndSerializeNewFile(file, service, data, 'banners');

        try {
            await service.update({ banner });
            return response.json({ message: 'success' })
        } catch (err) {
            console.log('ERROR BANNER CONTROLE - UPDATE', err);
            return response.json({ error: err })
        }
    }
    
    async delete(request: Request, response: Response ) { 
        const { id } = request.params;

        if (!id) return response.status(400).json({ error: 'No banner provided! '});
        
        try {
            await fileService.deleteFile(service, Number(id));
            await service.delete(Number(id));
            return response.json({ message: 'success'});
        } catch (err) {
            console.log('ERROR BANNER CONTROLLER DELETE', err);
            return response.status(400).json({ error: err});
        }
    }

}

export default BannerController;