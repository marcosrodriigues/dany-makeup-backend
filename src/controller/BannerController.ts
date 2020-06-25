import { Request, Response, request } from "express";
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

        try {
            const { banners, count } = await service.findAll(String(name), Number(limit), offset);

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

    async store(request: Request, response: Response ) { 
        const {
            name,
            description,
            start,
            end
        } = request.body;

        const { file } = request;

        if (!file) {
            console.log("NO FILE PROVIDED BANNER STORE");
            return response.status(400).json({error: 'No file provided!'});
        }

        const image_url = fileService.serializeImageUrl(file.filename, 'banners');

        try {
            await service.store({
                name,
                description,
                start,
                end,
                image_url
            });
            return response.json({ status: 'created' })
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

        if (!file && image_url === "") {
            console.log("NO FILE PROVIDED BANNER STORE");
            return response.status(400).json({error: 'No file provided!'});
        }

        if (!id) {
            console.log("No banner id provided");
            return response.status(400).json({error: 'No banner provided!'});
        }

        try {
            const banner = await service.findOne(Number(id));
            if (banner.image_url !== image_url)
                await fileService.remove(banner.image_url);
        } catch (err) {
            console.log("not possible to remove file in update banner", err);
        }
            
        let new_image_url = image_url;
        if (file) {
            new_image_url = fileService.serializeImageUrl(file.filename, 'banners');  
        } 

        try {
            await service.update({
                id,
                name,
                description,
                start,
                end,
                image_url: new_image_url
            });
            return response.json({ status: 'updated' })
        } catch (err) {
            console.log('ERROR BANNER CONTROLE - UPDATE', err);
            return response.json({ error: err })
        }
    }
    
    async delete(request: Request, response: Response ) { 
        const { id } = request.params;
        if (!id) return response.status(400).json({ error: 'No banner provided! '});
        
        try {
            const banner = await service.findOne(Number(id));
            await fileService.remove(banner.image_url);
        } catch (err) {
            console.log("Error delete file banner controller", err)
        }

        try {
            await service.delete(Number(id));
            return response.json({ message: 'removed'});
        } catch (err) {
            console.log('ERROR BANNER CONTROLLER DELETE', err);
            return response.status(400).json({ error: err});
        }
    }

}

export default BannerController;