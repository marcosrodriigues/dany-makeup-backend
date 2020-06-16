import path from 'path';
import fs from 'fs';
import { SERVER_IP } from '../config/info';

class FileService {
    async remove(url:string) {
        if (!url.startsWith(SERVER_IP)) throw "Image not available";
        
        const filename = this.getFilename(url);
        
        const pathfile = path.resolve(__dirname, '..', '..', 'uploads', filename);

        try {
            fs.unlinkSync(pathfile);
            return true;
        } catch (err) {
            throw err;
        }
    }

    getFilename(url: string) {
        if (url.startsWith("http")) {
            return String(url).substring(String(url).lastIndexOf('/') + 1, url.length) 
        }
        return url;
    }

    serializeImageUrl(filename: string) {
        return `${SERVER_IP}/uploads/${filename}`
    }
}

export default FileService;