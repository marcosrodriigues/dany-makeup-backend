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

        try {
            const user = await service.save({
                name, 
                email, 
                password: password_encrypted
            });

            return response.json(user);
        } catch (err) {
            return response.status(400).json({ error: 'Unable to store user: ' + err });
        }
    }
    async delete(request: Request, response: Response) { }
    async update(request: Request, response: Response) { 
        try {
            const me = await service.findMe(request);
            let { id, name, email, whatsapp, password, image } = request.body;

            console.log(me);

            if (!me) return response.status(400).json({ error: 'Operation unathorization. Not possible to get user online'});
            if (me.id != id) return response.status(400).json({ error: 'Operation unathorization. Seems you\' not the own of this account'});

            if (password != me.password) {
                password = crypt.encrypt(password);
            }

            const user = await service.update({
                id, name, email, whatsapp, password, image
            });

            return response.json(user);
        } catch (error) {
            return response.status(400).json({ error: 'Unable to update the user: ' + error });
        }
        
        
    }
    async login(request: Request, response: Response) {
        const { email, password } = request.body;

        console.log(email, password);

        const user = await service.login(email, password);

        if (!user) return response.status(400).json({ error: 'Email or password invalid.'})
        
        const token = await utilJwt.generateToken(user.id);

        return response.json({
            user,
            token
        })

    }

    async me(request:Request, response:Response) {
        try {
            const user = await service.findMe(request);
        
            if (user)
                return response.json(user);

            return response.status(400).json({ error: "Can't get user information" })
        } catch (err) {
            return response.status(400).json({ error: "Can't get user information" })
        }
        
    }
}

export default UserControlloer