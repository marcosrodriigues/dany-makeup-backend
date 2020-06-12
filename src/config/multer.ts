import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

export default {
    storage: multer.diskStorage({
        destination: path.resolve(__dirname, '..', '..', 'uploads/'),
        filename(request, file, callback) {
            const hash = crypto.randomBytes(8).toString('hex');
            const filename = `${hash}_${Date.now()}_${file.originalname}`;

            callback(null, filename);            
        }
    })
}