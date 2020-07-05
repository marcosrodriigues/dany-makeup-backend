import ProductService from "../services/ProductService";
import { Request, Response } from "express";
import ProductImagesService from "../services/ImageService";
import FileService from "../services/FileService";

const service = new ProductService();
const piService = new ProductImagesService();
const fileService = new FileService();

class ProductController {
    async index(request:Request, response: Response) {
        const {
            page = 1,
            name = '',
            limit = 5
        } = request.query;

        const offset = Number(limit) * (Number(page) - 1);

        const options = {
            filter: {
                products: {
                    name: String(name),
                    short_description: String(name),
                    full_description: String(name)
                }
            },
            pagination: {
                limit,
                offset
            }
        }

        try {
            const { products, count } = await service.find(options);
            response.setHeader("x-total-count", Number(count));
            response.setHeader("Access-Control-Expose-Headers", "x-total-count");
            return response.json(products);
        } catch (err) {
            console.log("erro index products controller", err)
            return response.status(400).json({ error: err });
        }
    }    

    async show(request:Request, response: Response) {
        const { id } = request.params;
        const product = await service.findOne(Number(id));
        return response.json(product);
    }   

    async store(request:Request, response: Response) {
        const {
            name,
            short_description,
            full_description,
            value,
            amount,
            categorys,
            image_url,
            manufacturer_id,

            store_id,
            amounts

         } = request.body;
         const { files } = request;

         if (!files) return response.status(400).json({ error: 'No files provided' });

         let final_image_url;
         let images = []
         for (let i = 0; i < files.length; i++) {
             if (files[i].originalname == image_url) 
                final_image_url = fileService.serializeImageUrl(files[i].filename, 'products');

            images.push(fileService.serializeImageUrl(files[i].filename, 'products'));
         }

         const product = {
            name,
            short_description,
            full_description,
            value,
            amount,
            image_url: final_image_url,
            manufacturer_id
         }

         const stocks = store_id.map((store, i) => {
             return {
                 store_id: store,
                 amount: amounts[i]
             }
         })
        
         try {
            await service.store({ 
                product, 
                images,
                categorys: categorys.split(','), 
                stocks 
            })

            return response.json(product);
         } catch (err) {
             console.log(err);
             return response.status(400).json({ error: err })
         }
    }   

    async update(request:Request, response: Response) {
        const {
            id,
            name,
            short_description,
            full_description,
            value,
            amount,
            categorys,
            image_url,
            url_images,
            manufacturer_id,

            stock_id,
            amounts
         } = request.body;
        const { files } = request;

        let images = url_images || [];
        let final_image_url = "";

         if (url_images) {
            const database_files = await piService.findByProduct(id);
            database_files.map(db => {
                let contains = false;
                url_images.map((url:string) => {
                   if (url === db.url) contains = true;
                })
                if (!contains)
                   fileService.remove(db.url)
            })
         }

         if (files.length > 0) {
            for (let i = 0; i < files.length; i++) {
                if (files[i].originalname == image_url) 
                    final_image_url = fileService.serializeImageUrl(files[i].filename, 'products');
   
                images.push(fileService.serializeImageUrl(files[i].filename, 'products'))
            }
         }

         final_image_url = final_image_url !== "" ? final_image_url : image_url;



         const stocks = stock_id.map((stock, i) => {
            return {
                id: stock,
                amount: amounts[i]
            }
        })

        const product = {
            id,
            name,
            short_description,
            full_description,
            value,
            amount,
            image_url: final_image_url,
            manufacturer_id
         }

        try {
            await service.updates({ 
                product, 
                images,
                categorys: categorys.split(','), 
                stocks 
            });

            return response.json({ message : 'success' });
        } catch (err) {
            console.log(err);
            return response.status(400).json({ error: err })
        }
    }   

    async delete(request: Request, response: Response) {
        const { id } = request.params;
        if (!id) return response.status(400).json({});

        const database_files = await piService.findByProduct(Number(id));
        database_files.map(db => {
            try {
                fileService.remove(db.url)
            } catch (err) { }
        })

        try {
            await service.delete(Number(id));
            return response.json({ message: 'success'});
        } catch (err) {
            throw err;
        }
    }

    async list(request:Request, response: Response) {
        const {
            category_id = 0,
            search = ''
        } = request.query;

        try {
            const products = await service.findByCategoryAndSearch({
                category_id: Number(category_id),
                search: String(search)
            });
            return response.json(products);
        } catch (err) {
            console.log(err);
            return response.status(400).json({ error: err })
        }

     }

}

export default ProductController;