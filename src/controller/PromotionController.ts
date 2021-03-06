import { Request, Response } from "express";
import FileService from "../services/FileService";
import PromotionService from "../services/PromotionService";
import PromotionImagesService from "../services/PromotionImagesService";
import ProductImagesService from "../services/ImageService";

const fileService = new FileService();
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

        const options = {
            filter: {
                promotions: {
                    name
                },
                products: {
                    name
                }
            },
            pagination: {
                limit,
                offset
            }
        }

        try {
            const { promotions, count } = await service.find(options);

            response.setHeader("x-total-count", Number(count));
            response.setHeader("Access-Control-Expose-Headers", "x-total-count");
            return response.json(promotions);
        } catch (err) {
            console.log("ERROR PROMOTION CONTROLLER - INDEX\n", err);
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
            promotion,
            products,
            images
        } = request.body;
        const { files } = request as any;
        if (!files && images.length === 0) return response.status(400).json({ error: 'No files provided' });

        const objPromotion = JSON.parse(promotion);

        let serialized = images;
        let final_image_url = objPromotion.image_url;
        
        for (let i = 0; i < files.length; i++) {
            if (files[i].originalname == final_image_url) 
                final_image_url = await fileService.serializeImageUrl(files[i].filename, 'promotions');

            serialized.push(await fileService.serializeImageUrl(files[i].filename, 'promotions'))
        }

        const finalPromotion = {
            name: objPromotion.name,
            start: objPromotion.start,
            end: objPromotion.end,
            originalValue: objPromotion.originalValue,
            promotionValue: objPromotion.promotionValue,
            discount: objPromotion.discount,
            discountType: objPromotion.discountType,
            description: objPromotion.description || '',
            image_url: final_image_url
        }

        try {
            await service.store({ 
                promotion: finalPromotion,
                products: products,
                images: serialized
            });
           return response.json({message: 'success'});
        } catch (err) {
            console.log('Error PROMOTION CONTROLLER STORE', err)
            return response.status(400).json({ error: err })   
        }
    }

    async update(request: Request, response: Response) {
        const {
            promotion,
            products,
            images
        } = request.body;

        const { files } = request as any;
        if (!files && images.length === 0) return response.status(400).json({ error: 'No files provided' });
        
        const objPromotion = JSON.parse(promotion);

        let serialized = images;
        let final_image_url = objPromotion.image_url;

        if (files && files.length > 0) {
            for (let i = 0; i < files.length; i++) {
                if (files[i].originalname == final_image_url) 
                    final_image_url = await fileService.serializeImageUrl(files[i].filename, 'promotions');

                serialized.push(await fileService.serializeImageUrl(files[i].filename, 'promotions'))
            }
        }

        const finalPromotion = {
            ...objPromotion,
            image_url: final_image_url
        }

        try {
            await service.update({
                promotion: finalPromotion,
                images,
                products
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
        await Promise.all(database_files.map(async db => {
            const fileFromProduct = await productImagesService.existsByUrl(db.url)
            if (fileFromProduct === false)
                await fileService.remove(db.url)
        }))

        try {
            await service.delete(Number(id));
            return response.json({ message: 'removed'});
        } catch (err) {
            console.log('ERROR PROMOTION CONTROLLER DELETE', err);
            return response.status(400).json({ error: err});
        }

    }

    async available(request: Request, response: Response ) { 
        try {
            
            const availables = await service.findAvailables();
            return response.json(availables);
        } catch (err) {
            console.log("erro show promotion controller", err)
            return response.status(400).json({ error: err });
         }
    }
}

export default PromotionController;