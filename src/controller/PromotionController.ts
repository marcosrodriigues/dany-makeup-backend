import { Request, Response } from "express";
import FileService from "../services/FileService";
import ProductService from "../services/ProductService";
import PromotionService from "../services/PromotionService";
import PromotionImagesService from "../services/PromotionImagesService";
import ProductImagesService from "../services/ProductImagesService";

const fileService = new FileService();
const productService = new ProductService();
const service = new PromotionService();
const promotionImagesService = new PromotionImagesService();
const productImagesService = new ProductImagesService();

class PromotionController {
    async index(request: Request, response: Response) {
        const {
            name = "",
            page = 1,
            limit = 5
        } = request.query;

        const offset = Number(limit) * (Number(page) - 1);

        try {
            const { promotions, count } = await service.findAll(String(name), Number(limit), offset);

            response.setHeader("x-total-count", Number(count));
            response.setHeader("Access-Control-Expose-Headers", "x-total-count");
            return response.json(promotions);
        } catch (err) {
            console.log("ERROR PROMOTION CONTROLLER - INDEX\n");
            return response.status(400).json({ error: err })   
        }
    }

    async show(request: Request, response: Response) {
        const { id } = request.params;
        const promotion = await service.findOne(Number(id));
        return response.json(promotion);   
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
               mainImageNew = fileService.serializeImageUrl(files[i].filename, 'promotions');

           serializedFiles.push(fileService.serializeImageUrl(files[i].filename, 'promotions'))
        }

        const db_prod = await productService.findInIdsWithoutFilter(products.split(','));

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
        const {
            id,
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

        if (!files && mainImage === "" && images.length === 0) {
            console.log("no files provided");
            return response.status(400).json({ error: 'No files provided' });
        }

        
        let serializedFiles = images;
        let mainImageNew = mainImage;

        if (files && files.length > 0) {
            for (let i = 0; i < files.length; i++) {
                if (files[i].originalname == mainImageNew) 
                    mainImageNew = fileService.serializeImageUrl(files[i].filename, 'promotions');

                serializedFiles.push(fileService.serializeImageUrl(files[i].filename, 'promotions'))
            }
        }
        try {
            const database_files = await promotionImagesService.findByPromotion(Number(id));
            database_files.map(async db => {
                const fileFromProduct = await productImagesService.existsByUrl(db.url)
                if (fileFromProduct === false)
                    fileService.remove(db.url)
            })

            const db_prod = await productService.findInIdsWithoutFilter(products.split(','));

            await service.update({
                id,
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
            console.log('Error PROMOTION CONTROLLER UPDATE', err)
            return response.status(400).json({ error: err })   
        }
    }

    async delete(request: Request, response: Response) {
        const { id } = request.params;
        if (!id) return response.status(400).json({ error: 'No promotion provided! '});

        const database_files = await promotionImagesService.findByPromotion(Number(id));
        database_files.map(async db => {
            const fileFromProduct = await productImagesService.existsByUrl(db.url)
            if (fileFromProduct === false)
                 fileService.remove(db.url)
        })

        try {
            await service.delete(Number(id));
            return response.json({ message: 'removed'});
        } catch (err) {
            console.log('ERROR PROMOTION CONTROLLER DELETE', err);
            return response.status(400).json({ error: err});
        }

    }
}

export default PromotionController;