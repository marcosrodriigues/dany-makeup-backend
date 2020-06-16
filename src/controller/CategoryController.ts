import { Request, Response } from 'express';
import CategoryService from '../services/CategoryService';

const service = new CategoryService();

class CategoryController {
    async index(request: Request, response: Response) {
        const { available } = request.query;

        const all = await service.findAll();

        if (available) {
            const filtered = await all.filter(cat => cat.available);
            return response.json(filtered);
        }

        return response.json(all)
    }

    async show(request: Request, response: Response) {
        const { id } = request.params;

        const one = await service.findOne(Number(id));

        return response.json(one);
    }

    async store(request: Request, response: Response) {
        const { title } = request.body;
        const available = request.body.available === "true";

        const categorySerialized = service.serialize({ 
                title,
                available,
                image_url: request.file.filename 
        })

        const category = await service.store(categorySerialized);
        return response.json(category);
    }
    
    async update(request: Request, response: Response) {
        const { id, title, image_url } = request.body;
        const available = request.body.available === "true";

        let categoryToUpdate: any = { id, title, available, image_url };

        if (request.file) {
            categoryToUpdate = service.serialize({ 
                id,
                title,
                available,
                image_url: request.file.filename 
            })
        }

        const category = await service.update(categoryToUpdate);
        
        return response.json(category);
    }

    async delete(request: Request, response: Response) {
        const { id } = request.params;

        const category = await service.findOne(Number(id));

        if (category) 
            await service.delete(Number(id));

        return response.status(200);
    }

    
}

export default CategoryController;