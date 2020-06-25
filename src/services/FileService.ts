import path from 'path';
import fs from 'fs';
import { SERVER_IP } from '../config/info';

class FileService {
    async remove(url:string) {
        if (!url.startsWith(SERVER_IP)) throw "Image not available";
        
        const filename = this.getFilename(url);
        const folder = this.getFolder(url);

        const pathfile = path.resolve(__dirname, '..', '..', 'uploads', folder, filename);

        try {
            fs.unlinkSync(pathfile);
            return true;
        } catch (err) {
            throw err;
        }
    }

    getFilename(url: string) {
        if (url.startsWith(SERVER_IP)) {
            return String(url).substring(String(url).lastIndexOf('/') + 1, url.length) 
        }
        return url;
    }

    getFolder(url: string) {
        if (url.startsWith(SERVER_IP)) {
            const splited = url.split('/uploads/')[1];
            return splited.substring(0, splited.indexOf('/'));
        }
        return url;
    }

    serializeImageUrl(filename: string, folder: string) {
        return `${SERVER_IP}/uploads/${folder}/${filename}`
    }
}

export default FileService;