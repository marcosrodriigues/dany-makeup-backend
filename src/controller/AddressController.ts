import { Request, Response } from "express";
import AddressService from "../services/AddressService";

const service = new AddressService();

class AddressController {
    async store(request: Request, response: Response) {
        const {
            address,
            user_id
        } = request.body;

        try {
            const id = await service.store({ address })
            await service.addressUser({ user_id, address_id: id[0]})

            return response.json({ message: 'success' });
        } catch (err) {
            console.log('ERROR STORE ADDRESS CONTROLLER', err)
            return response.status(400).json({ message: err })
        }
    }

    async update(request: Request, response: Response) {
        const {
            address,
        } = request.body;

        try {
            await service.update({ address })

            return response.json({ message: 'success' });
        } catch (err) {
            console.log('ERROR STORE ADDRESS CONTROLLER', err)
            return response.status(400).json({ message: err })
        }
    }

    async byUser(request: Request, response: Response) {
        const { user_id } = request.params;
        try {
            if (Number(user_id) === 0) return response.status(400).json({ message: 'No user provided '})

            const address = await service.findByUser(Number(user_id));
            return response.json(address);
        } catch (err) {
            console.log('ERROR ADDRESS CONTROLLER - BY USER', err)
            return response.status(400).json({ message: err })
        }
    }

    async delete (request: Request, response: Response) {
        const { id } = request.params;

        try {
            await service.delete(Number(id));
            return response.json({ message: 'success' })
        } catch (err) {
            console.log('ERROR ADDRESS CONTROLLER - DELETE', err)
            return response.status(400).json({ message: err })
        }
    }
}

export default AddressController;