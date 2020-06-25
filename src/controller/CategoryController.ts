import { Request, Response } from 'express';
import CategoryService from '../services/CategoryService';
import FileService from '../services/FileService';

const service = new CategoryService();
const fileService = new FileService();

class CategoryController {
    async index(request: Request, response: Response) {
        const {
            page = 1,
            title = '',
            limit = 5,
            filter = true
        } = request.query;

        const offset = Number(limit) * (Number(page) - 1);

        try {
            if (filter !== true) {
                const categorys = await service.findWithoutFilter();
                return response.json(categorys);
            }

            const { categorys, count } = await service.findAll(String(title), Number(limit), offset);

            response.setHeader("x-total-count", Number(count));
            response.setHeader("Access-Control-Expose-Headers", "x-total-count");
            return response.json(categorys);
         } catch (err) {
            console.log("erro index category controller", err)
            return response.status(400).json({ error: err });
         }
         
    }

    async show(request: Request, response: Response) {
        const { id } = request.params;

        if (!id) return response.status(400).json({ message: 'No category provided' })

        try {
            const one = await service.findOne(Number(id));
            return response.json(one);
        } catch (err) {
            console.log("erro show category controller", err)
            return response.status(400).json({ error: err });
         }
    }

    async store(request: Request, response: Response) {
        const { file } = request;
        const { title, description } = request.body;
        const available = request.body.available === "true";

        if (!file) return response.status(400).json({ error: "No image provided!" });

        const image_url = fileService.serializeImageUrl(file.filename, 'categorys');

        try {
            const category = await service.store({
                title, available, image_url, description
            });
    
            return response.json(category);
        } catch( err) {
            console.log("erro store category controller", err)
            return response.status(400).json(err);
        }
    }
    
    async update(request: Request, response: Response) {
        const {
            id,
            title,
            description,
            image_url
        } = request.body;
        const available = request.body.available === "true";

        const { file } = request;

        let category: any = { id, title, description, image_url, available };
        
        if (file) {
            try {
                const database_category = await service.findOne(id);
                await fileService.remove(database_category.image_url)
            } catch (err) {
                console.log("erro update (file) category controller", err)
                //return response.status(400).json({ error: err });
            }

            category = {
                ...category,
                image_url: fileService.serializeImageUrl(file.filename, 'categorys')
            }
        }

        try {
            const saved = await service.update(category);
            return response.json(saved);
        } catch (err) {
            console.log("erro update category controller", err)
            return response.status(400).json({ error: err });
        }
    }

    async delete(request: Request, response: Response) {
        const { id } = request.params;

        if (!id) return response.status(400).json({ error: 'No category provider!' });

        try {
            const category = await service.findOne(Number(id));
            await fileService.remove(category.image_url)
        } catch (err) {
            console.log("erro delete (file) category controller", err)
            //return response.status(400).json({ error: err });
        }

        try {
            await service.delete(Number(id));
            return response.json({ status: 'deleted' });
        } catch (err) {
            console.log("erro delete category controller", err);
            return response.status(400).json({ error: err });
        }
    }

    async categoryProduct(request: Request, response: Response) {
        try {
            const categorys = await service.findWithProduct();
            const categorys_products = await Promise.all(
                categorys.map(async (cat: any) => {
                    cat.products = await service.findProducts(cat.id)
                    return cat;
                })
            );
            
            return response.json(categorys_products);
        } catch (err) {
            console.log("Error category controller - categoryProduct");
            return response.status(400).json({ error: err })
        }
    }
}

export default CategoryController;