import { Request, Response } from 'express';
import Crypto from '../util/crypto';
import UserService from '../services/UserService';
import UtilJwt from '../security/utilJwt';
import FileService from '../services/FileService';

const service = new UserService();
const crypt = new Crypto();
const utilJwt = new UtilJwt();
const fileService = new FileService();

class UserControlloer {

    async index(request: Request, response: Response) { 
        const {
            search = "",
            page = 1,
            limit = 5
        } = request.query;

        const offset = Number(limit) * (Number(page) - 1);

        try {
            const { users, count } = await service.findAll(String(search), Number(limit), offset);

            response.setHeader("x-total-count", Number(count));
            response.setHeader("Access-Control-Expose-Headers", "x-total-count");
            return response.json(users);
        } catch (err) {
            console.log("ERROR USER CONTROLLER - INDEX\n");
            return response.status(400).json({ error: err })   
        }
        
    }
    async show(request: Request, response: Response) {
        const { id } = request.params;

        if (!id) return response.status(400).json({ message: 'No user provided' })

        try {
            const { user, address } = await service.findOne(Number(id));
            return response.json({ user, address });
        } catch (err) {
            console.log("erro show user controller", err)
            return response.status(400).json({ error: err });
         }
    }
    async facebookId(request: Request, response: Response) {
        const {
            fb_id
        } = request.params;
        
        if (!fb_id) {
            console.log("Facebook_ID not provided");
            return response.status(400).json({ error: 'Facebook ID not provided' });
        }

        const user = await service.findByFacebookId(fb_id);
        
        if (!user) {
            console.log("User not found with fb_id: " + fb_id);
            return response.status(400).json({ error: 'User not found' });
        }

        const token = await utilJwt.generateToken(user.id);

        return response.json({ user, token });
    }
    
    async store(request: Request, response: Response) {
        const { 
            name, 
            email, 
            password,
            image,
            fb_id,
            whatsapp
        } = request.body;

        
        try {

            const emailValid = await service.verifyMail(email);
            if (!emailValid) {
                console.log("Email ja usado: " + email);
                return response.status(401).json({error: 'Email already used!'})
            }
            
            
            if (fb_id !== undefined) {
                const fbIdUser = await service.findByFacebookId(fb_id);
                
                if(fbIdUser) {
                    console.log("Conta do facebook da usada: " + fb_id);
                    return response.status(401).json({error: 'Conta do Facebook já está sendo usada!'});
                }
            }

            const password_encrypted = password ? await crypt.encrypt(password) : undefined;

            const user = await service.save({
                name, 
                email, 
                password: password_encrypted,
                image,
                fb_id,
                whatsapp
            });

            return response.json(user);
        } catch (err) {
            console.log(err);
            return response.status(400).json({ error: 'Unable to store user: ' + err });
        }
    }
    async delete(request: Request, response: Response) { }
    
    async update(request: Request, response: Response) { 
        const {
            user,
            address
        } = request.body;

        const { file } = request;

        let { id, name, email, password, whatsapp, fb_id } = user;
        const image = file ? fileService.serializeImageUrl(file.filename, 'users') : user.image;
        
        try {
            const current_user = await service.findOne(Number(id));

            if (password !== current_user.user.password) password = await crypt.encrypt(password);
            if (email !== current_user.user.email) {
                const userByEmail = await service.findByEmail(email)

                if (userByEmail) throw "Email já utilizado!"
            }

            const user_updated = await service.update({
                id, name, email, whatsapp, password, image, fb_id
            }, address);

            return response.json(user_updated);
        } catch (error) {
            return response.status(400).json({ error: 'Unable to update the user: ' + error });
        }
        
        
    }
    async login(request: Request, response: Response) {
        const { email, password } = request.body;

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