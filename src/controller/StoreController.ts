import { Response, Request } from "express";

import FileService from '../services/FileService';
import StoreService from "../services/StoreService";

const service = new StoreService();
const fileService = new FileService();

class StoreController {
    async index (request: Request, response: Response) {
        const { 
            page = 1,
            name = '',
            limit = 5,
            filter = true
         } = request.query;

         const offset = Number(limit) * (Number(page) - 1);

         try {
            if (filter === true) {
                const { stores, count } = await service.find(String(name), Number(limit), offset);

                response.setHeader("x-total-count", Number(count));
                response.setHeader("Access-Control-Expose-Headers", "x-total-count");
                return response.json(stores);
            }

            const stores = await service.find('', 500, 0);
            return response.json(stores);
         } catch (err) {
            console.log("erro index store controller", err)
            return response.status(400).json({ error: err });
         }
         
    }

    async show (request: Request, response: Response) {
        const { id } = request.params;

        if (!id || Number(id) === 0) return response.status(400).json({ message: 'No store provided' })

        try {
            const one = await service.findOne(Number(id));
            return response.json(one);
        } catch (err) {
            console.log("erro show store controller", err)
            return response.status(400).json({ error: err });
         }
    }

    async store (request: Request, response: Response) {
        const {
            name,
            description,
            
            address_name,
            cep,
            street,
            city,
            uf,
            number,
            neighborhood,
            reference,
            complement
        } = request.body;

        const { file } = request;

        if (!file) return response.status(400).json({ error: "No image provided!" });
        const image_url = fileService.serializeImageUrl(file.filename, 'stores');

        const address = {
            name: address_name,
            cep,
            street,
            city,
            uf,
            number,
            neighborhood,
            reference,
            complement
        }

        const store = { name, description, image_url };
        try {
            await service.store({ store, address });
    
            return response.json({ message: 'success' });
        } catch( err) {
            console.log("erro store lojas controller", err)
            return response.status(400).json(err);
        }
    }

    async update (request: Request, response: Response) {
        const {
            id,
            name,
            description,
            image_url,

            address_id,
            address_name,
            cep,
            street,
            city,
            uf,
            number,
            neighborhood,
            reference,
            complement
        } = request.body;

        const { file } = request;

        let store: any = { id, name, description, image_url };
        
        if (file) {
            try {
                const stor = await service.findOne(id);
                await fileService.remove(stor.image_url)
            } catch (err) {
                console.log("erro update (file) store controller", err)
                //return response.status(400).json({ error: err });
            }

            store = {
                ...store,
                image_url: fileService.serializeImageUrl(file.filename, 'stores')
            }
        }

        const address = {
            id: address_id,
            name: address_name,
            cep,
            street,
            city,
            uf,
            number,
            neighborhood,
            reference,
            complement
        }

        try {
            await service.update({ store, address });
            return response.json({ message: 'success' });
        } catch (err) {
            console.log("erro update store controller", err)
            return response.status(400).json({ error: err });
        }
    }

    async delete (request: Request, response: Response) {
        const { id } = request.params;

        if (!id) return response.status(400).json({ error: 'No store provided!' });

        try {
            const store = await service.findOne(Number(id));
            await fileService.remove(store.image_url)
        } catch (err) {
            console.log("erro delete (file) store controller", err)
        }

        try {
            await service.delete(Number(id));
            return response.json({ message: 'success' });
        } catch (err) {
            console.log("erro delete store controller", err);
            return response.status(400).json({ error: err });
        }
    }
}

export default StoreController;