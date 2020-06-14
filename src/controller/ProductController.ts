import ProductService from "../services/ProductService";
import { Request, Response } from "express";

const service = new ProductService();

class ProductController {
    async index(request:Request, response: Response) {
        const products = await service.findAll();
        return response.json(products);
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
            mainImage
         } = request.body;
         const available = request.body.available === "true";

         const { files } = request;

         let serializedFiles = [];
         let mainImageNew = "";

         for (let i = 0; i < files.length; i++) {
             if (files[i].originalname == mainImage) 
                mainImageNew = service.serializeImage(files[i].filename);

            serializedFiles.push(service.serializeImage(files[i].filename))
         }

         try {
             const product = await service.store({
                name,
                shortDescription,
                fullDescription,
                value,
                amount,
                available,
                mainImage: mainImageNew,
                images: serializedFiles
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
            url_images
         } = request.body;

        const available = request.body.available === "true" || request.body.available === "1";
        
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
                images: serializedFiles 
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