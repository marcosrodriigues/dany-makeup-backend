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
        } = request.query;

        const offset = Number(limit) * (Number(page) - 1);

        const options = {
            filter: {
                title: String(title),
            },
            pagination: {
                limit: limit,
                offset: offset
            }
        }
        try {
                const { categorys, count } = await service.find(options);
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

        if (!file) return response.status(400).json({ error: "No image provided!" });

        const image_url = fileService.serializeImageUrl(file.filename, 'categorys');

        const category = {
            title,
            description,
            image_url
        }

        try {
            await service.store({ category });
            return response.json({ message: 'success' });
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
        const { file } = request;

        let data: any = { id, title, description, image_url };
        
        const category = await fileService
            .deleteFileAndSerializeNewFile(file, service, data, 'categorys')

        try {
            await service.update({ category });
            return response.json({ message: 'success' });
        } catch (err) {
            console.log("erro update category controller", err)
            return response.status(400).json({ error: err });
        }
    }

    async delete(request: Request, response: Response) {
        const { id } = request.params;

        if (!id) return response.status(400).json({ error: 'No category provider!' });
        
        try {
            await fileService.deleteFile(service, Number(id));
            await service.delete(Number(id));
            return response.json({ message: 'success' });
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