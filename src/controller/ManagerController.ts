import { Response, Request } from "express";

class ManagerController {
    async auth(request: Request, response: Response) {
        const { credentials } = request.body;

        const {
            username,
            password
        } = JSON.parse(credentials);

        try {
            const DB_USER = process.env.MANAGER_USERNAME || '';
            const DB_PASS = process.env.MANAGER_PASSWORD || '';

            if ('' === DB_USER || '' === DB_PASS)  {
                console.log('DB_USER OR DB_PASS EMPTY');
                return response.status(400).json({ message: 'NOT POSSIBLE TO LOAD ENV SETTINGS'});
            }

            if (username === DB_USER && password === DB_PASS)
                return response.json({ message: 'success' });

            return response.status(401).json({ message: 'invalid credential'})
        } catch (error) {
            throw response.status(400).json({error})
        }
    }
}

export default ManagerController;
