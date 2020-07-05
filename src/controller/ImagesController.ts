import { Request, Response } from "express";
import ImagesService from "../services/ImageService";

const service = new ImagesService();

class ImagesController {
    async listByProduct(request: Request, response: Response) {
        const { id } = request.params;

        if (!id) return response.status(400).json({ error: 'No product provided;.'})

        try {
            const images = await service.findByProduct(Number(id));
            return response.json(images);
        } catch (err) {
            console.log("Error images controller list product!", err)
            return response.status(400).json({ error: err})
        }
    }

    async listByPromotion(request: Request, response: Response) {
        const { id } = request.params;

        if (!id) return response.status(400).json({ error: 'No promotion provided;.'})

        try {
            const images = await service.findByProduct(Number(id));
            return response.json(images);
        } catch (err) {
            console.log("Error images controller list promotion!", err)
            return response.status(400).json({ error: err})
        }
    }
}

export default ImagesController;