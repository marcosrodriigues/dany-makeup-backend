import { Request, Response } from 'express';
import Crypto from '../util/crypto';
import UserService from '../services/UserService';
import generateToken from '../security/utilJwt';
import IUser from '../interface/IUser';
import UtilJwt from '../security/utilJwt';

const service = new UserService();
const crypt = new Crypto();
const utilJwt = new UtilJwt();

class UserControlloer {

    async index(request: Request, response: Response) { 
        const users = await service.findAll();
        return response.json(users);
    }
    async show(request: Request, response: Response) {
        response.json({ page: 'show' })
    }
    async store(request: Request, response: Response) {
        const { 
            name, 
            email, 
            password 
        } = request.body;

        const emailValid = await service.verifyMail(email);

        if (!emailValid) return response.status(401).json({error: 'Email already used!'})

        const password_encrypted = await crypt.encrypt(password);

        const user = await service.save({
            name, 
            email, 
            password: password_encrypted
        })

        return response.json(user);
    }
    async delete(request: Request, response: Response) { }
    async update(request: Request, response: Response) { }
    async login(request: Request, response: Response) {
        const { email, password } = request.body;

        const user = await service.login(email, password);

        if (!user) return response.status(400).json({ error: 'Email or password invalid.'})
        
        console.log(await utilJwt.generateToken(user.id));

        return response.json({
            user: user,
            token: await utilJwt.generateToken(user.id)
        })

    }

    async me(request:Request, response:Response) {
        console.log("ENTROU");

        try {
            const { userId } = request;

            const user = await service.findOne(userId);
            console.log(user);
            return response.json(user);
        } catch (err) {
            return response.status(400).json({ error: "Can't get user information" })
        }
    }
}

export default UserControlloer