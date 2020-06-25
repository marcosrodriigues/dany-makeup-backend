import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';

export default {
    storage: multer.diskStorage({
        destination: function(request, file, callback) {
            const folder = request.route.path.replace('/', '');
            var dest = path.resolve(__dirname, '..', '..', 'uploads', folder);

            try {
                var stat = fs.statSync(dest);
            } catch (err) {
                fs.mkdirSync(dest);
            }
            
            callback(null, dest);
        },
        filename(request, file, callback) {
            const hash = crypto.randomBytes(8).toString('hex');
            const filename = `${hash}_${Date.now()}_${file.originalname}`;

            callback(null, filename);            
        }
    })
}
