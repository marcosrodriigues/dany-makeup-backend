import ProductService from "../services/ProductService";
import { Request, Response } from "express";
import ManufacturerService from "../services/ManufacturerService";

const service = new ProductService();
const manufacturerService = new ManufacturerService();

class ProductController {
    async index(request:Request, response: Response) {
        const {
            page = 1,
            input = '',
            limit = 5
        } = request.query;

        const offset = Number(limit) * (Number(page) - 1);

        try {
            const { products, count } = await service.findAll(String(input), Number(limit), offset);

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
                mainImageNew = service.serializeImage(files[i].filename);

            serializedFiles.push(service.serializeImage(files[i].filename))
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
        const available = request.body.available === "true";
        
        const { files } = request;

        let serializedFiles = url_images;
        let mainImageNew = "";

         if (files.length > 0) {
            for (let i = 0; i < files.length; i++) {
                if (files[i].originalname == mainImage) 
                   mainImageNew = service.serializeImage(files[i].filename);
   
                serializedFiles.push(service.serializeImage(files[i].filename))
            }
         }

        mainImageNew = mainImageNew !== "" ? mainImageNew : mainImage;

        const manufacturer = await manufacturerService.findOne(manufacturer_id) ;

         if (!manufacturer) {
             console.log("no manufacturer_id provided");
             return response.status(400).json({ error: 'No manufacturer provided' });
         }

         console.log(
            id,
            name,
            shortDescription,
            fullDescription,
            value,
            amount,
            available,
            mainImageNew,
            serializedFiles,
            manufacturer
         )

         return;

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

        const product = await service.findOne(Number(id));

        if (product) 
            await service.delete(Number(id));

        return response.status(200).json({ message: 'removed'});
    }
}

export default ProductController;