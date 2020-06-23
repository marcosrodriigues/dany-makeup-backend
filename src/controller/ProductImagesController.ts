import { Request, Response } from "express";
import ProductImagesService from "../services/ProductImagesService";

const service = new ProductImagesService();

class ProductImagesController {
    async show(request: Request, response: Response) {
        const { id } = request.params;

        if (!id) {
            console.log("No product provided!")
            return response.status(400).json({ error: 'No product provided;.'})
        }

        try {
            const images = await service.findByProduct(Number(id));
            return response.json(images);
        } catch (err) {
            console.log("Error product images controller show!")
            return response.status(400).json({ error: err})
        }
    }
}

export default ProductImagesController;