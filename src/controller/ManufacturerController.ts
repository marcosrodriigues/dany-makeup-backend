import { Response, Request } from "express";

import ManufacturerService from '../services/ManufacturerService';
import FileService from '../services/FileService';

const service = new ManufacturerService();
const fileService = new FileService();

class ManufacturerController {
    async index (request: Request, response: Response) {
        const { 
            page = 1,
            name = '',
            limit = 5,
         } = request.query;

         const offset = Number(limit) * (Number(page) - 1);

         const options = {
            filter: {
                name: String(name),
            },
            pagination: {
                limit: limit,
                offset: offset
            }
        }

         try {
            const { manufacturers, count } = await service.find(options);
            response.setHeader("x-total-count", Number(count));
            response.setHeader("Access-Control-Expose-Headers", "x-total-count");
            return response.json(manufacturers);
         } catch (err) {
            console.log("erro index manufacturer controller", err)
            return response.status(400).json({ error: err });
         }
         
    }

    async show (request: Request, response: Response) {
        const { id } = request.params;

        if (!id) return response.status(400).json({ message: 'No manufacturer provided' })

        try {
            const one = await service.findOne(Number(id));
            return response.json(one);
        } catch (err) {
            console.log("erro show manufacturer controller", err)
            return response.status(400).json({ error: err });
         }
    }

    async store (request: Request, response: Response) {
        const {
            name,
            description,
        } = request.body;

        const { file } = request;

        if (!file) return response.status(400).json({ error: "No image provided!" });
        const image_url = await fileService.serializeImageUrl(file.filename, 'manufacturers');
        
        const manufacturer = {
            name,
            description,
            image_url
        }

        try {
            await service.store({ manufacturer });
            return response.json({ message: 'success' });
        } catch( err) {
            console.log("erro store manufacturer controller", err)
            return response.status(400).json(err);
        }
    }

    async update (request: Request, response: Response) {
        const {
            id,
            name,
            description,
            image_url
        } = request.body;

        const { file } = request;

        let manufacturer: any = { id, name, description, image_url };
       
        manufacturer = await fileService.deleteFileAndSerializeNewFile(file, service, manufacturer, 'manufacturers')
       
        try {
            await service.update({ manufacturer });
            return response.json({ message: 'success' });
        } catch (err) {
            console.log("erro update manufacturer controller", err)
            return response.status(400).json({ error: err });
        }
        
    }

    async delete (request: Request, response: Response) {
        const { id } = request.params;

        if (!id) return response.status(400).json({ error: 'No manufacturer provider!' });

        try {
            await fileService.deleteFile(service, Number(id));
            await service.delete(Number(id));
            return response.json({ message: 'success' });
        } catch (err) {
            console.log("erro delete manufacturer controller", err);
            return response.status(400).json({ error: err });
        }
    }
}

export default ManufacturerController;