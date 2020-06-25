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
            filter = true
         } = request.query;

         const offset = Number(limit) * (Number(page) - 1);

         try {
            if (filter === true) {
                const { manufacturers, count } = await service.findAll(String(name), Number(limit), offset);

                response.setHeader("x-total-count", Number(count));
                response.setHeader("Access-Control-Expose-Headers", "x-total-count");
                return response.json(manufacturers);
            }

            const manufactures = await service.findWithoutFilter();
            return response.json(manufactures);
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

        const image_url = fileService.serializeImageUrl(file.filename, 'manufacturers');
        
        try {
            const manufactured = await service.store({
                name, description, image_url
            });
    
            return response.json(manufactured);
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
        
        if (file) {
            try {
                const manufacture = await service.findOne(id);
                await fileService.remove(manufacture.image_url)
            } catch (err) {
                console.log("erro update (file) manufacturer controller", err)
                return response.status(400).json({ error: err });
            }

            manufacturer = {
                ...manufacturer,
                image_url: fileService.serializeImageUrl(file.filename, 'manufacturers')
            }
        }

        try {
            const saved = await service.update(manufacturer);
            return response.json(saved);
        } catch (err) {
            console.log("erro update manufacturer controller", err)
            return response.status(400).json({ error: err });
        }
        
    }

    async delete (request: Request, response: Response) {
        const { id } = request.params;

        if (!id) return response.status(400).json({ error: 'No manufacturer provider!' });

        try {
            const manufacture = await service.findOne(Number(id));
            await fileService.remove(manufacture.image_url)
        } catch (err) {
            console.log("erro delete (file) manufacturer controller", err)
            return response.status(400).json({ error: err });
        }

        try {
            await service.delete(Number(id));
            return response.json({ status: 'deleted' });
        } catch (err) {
            console.log("erro delete manufacturer controller", err);
            return response.status(400).json({ error: err });
        }
    }
}

export default ManufacturerController;