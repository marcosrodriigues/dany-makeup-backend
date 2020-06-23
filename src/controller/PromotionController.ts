import { Request, Response } from "express";
import FileService from "../services/FileService";
import ProductService from "../services/ProductService";
import PromotionService from "../services/PromotionService";

const fileService = new FileService();
const productService = new ProductService();
const service = new PromotionService();

class PromotionController {
    async index(request: Request, response: Response) {
        return response.json({ page: 'index' })   
    }

    async show(request: Request, response: Response) {
        return response.json({ page: 'show' })   
    }

    async store(request: Request, response: Response) {
        const {
            name,
            start,
            end,
            originalValue,
            discountType,
            discount,
            promotionValue,
            mainImage,
            products,
            images
        } = request.body;

        const { files } = request;

        if (!files) {
            console.log("no files provided");
            return response.status(400).json({ error: 'No files provided' });
        }

        let serializedFiles = images;
        let mainImageNew = mainImage;

        for (let i = 0; i < files.length; i++) {
            if (files[i].originalname == mainImageNew) 
               mainImageNew = fileService.serializeImageUrl(files[i].filename);

           serializedFiles.push(fileService.serializeImageUrl(files[i].filename))
        }

        const db_prod = await productService.findInIdsWithoutFilter(products);

        try {
            await service.store({
                name,
                start,
                end,
                originalValue,
                discountType,
                discount,
                promotionValue,
                mainImage: mainImageNew,
                products: db_prod,
                images: serializedFiles
            });

            return response.json({message: 'success'});
        } catch (err) {
            console.log('Error PROMOTION CONTROLLER STORE', err)
            return response.status(400).json({ error: err })   
        }
    }

    async update(request: Request, response: Response) {
        return response.json({ page: 'update' })   
    }

    async delete(request: Request, response: Response) {
        return response.json({ page: 'delete' })   
    }
}

export default PromotionController;