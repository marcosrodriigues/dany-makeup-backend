import { Request, Response } from "express";
import CorreiosService from "../services/CorreiosService";

const service = new CorreiosService();

class CorreiosController {
    async frete(request: Request, response: Response) {
        const {
            cep
        } = request.query;

        try {
            await service.getFretesByCep(String(cep), (services: any) => {
                const serialized = services.map((s: any) => {
                    let code = s.Codigo;
                    let name = service.getNameService(code);
                    let value = Number(s.Valor.replace(',', '.'))
                    let deadline = Number(s.PrazoEntrega);
                    return {
                        code, name, value, deadline
                    }
                })

                return response.json(serialized);
            });
        } catch (err) {
            console.log('ERROR CORREIOSCONTROLLER FRETE', err)
            return response.status(400).json(err);
        }
    }
}

export default CorreiosController;