import { Response, Request } from "express";
import CreditCardService from "../services/CreditCardService";

const service = new CreditCardService();

class CreditCardController {
    async index(request: Request, response: Response) {
        const {
            user_id
        } = request.params;

        if (user_id === undefined) return response.json()

        const params: any = {
            filter: {
                user_id
            }
        }

        try {
            const credit_cards = await service.find(params);
            return response.json(credit_cards);
        } catch (error) {
            console.log("=== ERROR CREDIT CARD CONTROLLER INDEX ===");
            console.log(error);
            return response.status(400).json({ error })
        }
    }

    async store(request: Request, response: Response) {
        const {
            credit_card,
            user_id
        } = request.body;

        if (credit_card === undefined || user_id === undefined) 
            return response.status(400).json({ error: 'Informações inválidas.'})

        try {
            await service.save({
                credit_card,
                user_id
            })
            return response.json({ message: 'success' });
        } catch (error) {
            console.log('ERROR CREDIT_CARD CONTROLLER STORE:', error);
            return response.status(400).json({ error})
        }
    }

    async delete (request: Request, response: Response) {
        const { id } = request.params;

        if (!id) return response.status(400).json({ error: 'No credit card provided!' });

        try {
            await service.delete(Number(id));
            return response.json({ message: 'success' });
        } catch (error) {
            console.log("ERROR DELETE CREDIT CARD", error)
            return response.status(400).json({ error });
        }
    }

}

export default CreditCardController;