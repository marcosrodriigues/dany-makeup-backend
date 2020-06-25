import ProductService from "../services/ProductService";
import { Request, Response } from "express";
import ManufacturerService from "../services/ManufacturerService";
import ProductImagesService from "../services/ProductImagesService";
import FileService from "../services/FileService";

const service = new ProductService();
const manufacturerService = new ManufacturerService();
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

        try {
            const { products, count } = await service.findAll(String(name), Number(limit), offset);

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
            shortDescription,
            fullDescription,
            value,
            amount,
            categorys,
            mainImage,
            manufacturer_id,
         } = request.body;
         const available = request.body.available === "true";

         const { files } = request;

         let serializedFiles = [];
         let mainImageNew = "";

         if (!files) {
            console.log("no files provided");
            return response.status(400).json({ error: 'No files provided' });
         }

         for (let i = 0; i < files.length; i++) {
             if (files[i].originalname == mainImage) 
                mainImageNew = fileService.serializeImageUrl(files[i].filename, 'products');

            serializedFiles.push(fileService.serializeImageUrl(files[i].filename, 'products'));
         }

         const manufacturer = await manufacturerService.findOne(manufacturer_id) ;
         

         if (!manufacturer) {
             console.log("no manufacturer_id provided");
             return response.status(400).json({ error: 'No manufacturer provided' });
         }

         try {
             const product = await service.store({
                name,
                shortDescription,
                fullDescription,
                value,
                amount,
                available,
                manufacturer,
                mainImage: mainImageNew,
                images: serializedFiles,
             }, categorys.split(','));


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
            shortDescription,
            fullDescription,
            value,
            amount,
            categorys,
            mainImage,
            url_images,
            manufacturer_id
         } = request.body;
        const available = request.body.available === "true" || request.body.available === "1";
        
        const { files } = request;

        let serializedFiles = url_images || [];
        let mainImageNew = "";

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
                if (files[i].originalname == mainImage) 
                   mainImageNew = fileService.serializeImageUrl(files[i].filename, 'products');
   
                serializedFiles.push(fileService.serializeImageUrl(files[i].filename, 'products'))
            }
         }

         mainImageNew = mainImageNew !== "" ? mainImageNew : mainImage;

        const manufacturer = await manufacturerService.findOne(manufacturer_id) ;

         if (!manufacturer) {
             console.log("no manufacturer_id provided");
             return response.status(400).json({ error: 'No manufacturer provided' });
         }


        try {
            const product = await service.update({
                id,
                name,
                shortDescription,
                fullDescription,
                value,
                amount,
                available,
                mainImage: mainImageNew,
                images: serializedFiles,
                manufacturer
            }, categorys.split(','));

            return response.json(product);
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

        const product = await service.findOne(Number(id));

        if (product) 
            await service.delete(Number(id));

        return response.status(200).json({ message: 'removed'});
    }
}

export default ProductController;