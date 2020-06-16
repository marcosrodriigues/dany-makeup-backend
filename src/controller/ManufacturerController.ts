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
            limit = 10,
         } = request.query;

         const offset = Number(limit) * (Number(page) - 1);

         const { manufacturers, count } = await service.findAll(String(name), Number(limit), offset);

         response.setHeader("x-total-count", Number(count));
         response.setHeader("Access-Control-Expose-Headers", "x-total-count");
         return response.json(manufacturers);
    }

    async show (request: Request, response: Response) {
        const { id } = request.params;

        if (!id) return response.status(400).json({ message: 'No manufacturer provided' })

        const one = await service.findOne(Number(id));
        return response.json(one);

    }

    async store (request: Request, response: Response) {
        const {
            name,
            description,
        } = request.body;

        const { file } = request;

        if (!file) return response.status(400).json({ error: "No image provided!" });

        const image_url = fileService.serializeImageUrl(file.filename);
        
        try {
            const manufactured = await service.store({
                name, description, image_url
            });
    
            return response.json(manufactured);
        } catch( err) {
            console.log(err);
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

            const manufacture = await service.findOne(id);
            await fileService.remove(manufacture.image_url)

            manufacturer = {
                ...manufacturer,
                image_url: fileService.serializeImageUrl(file.filename)
            }
        }

        const saved = await service.update(manufacturer);
        return response.json(saved);
    }

    async delete (request: Request, response: Response) {

    }
}

export default ManufacturerController;