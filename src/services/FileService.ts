import path from 'path';
import fs from 'fs';

const SERVER_IP = process.env.SERVER_URL || '';

import StorageService from './StorageService';

const storage = new StorageService();
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
            const split = url.split('/uploads/')[1];
            return split.substring(0, split.indexOf('/'));
        }
        return url;
    }

    serializeImageUrl(filename: string, folder: string) {
        const pathfile = path.resolve(__dirname, '..', '..', 'uploads', folder, filename);
        const url = this.upload(pathfile);
        return url;
    }

    async upload(file: string) {
        try {
            const url = storage.store(file);
            return url;
        } catch(err) {
            console.log('error', err);
        }
    }

    async deleteFile(service: any, id: number) {
        try {
            const obj = await service.findOne(id);
            await this.remove(obj.image_url)
        } catch (err) {
            console.log("ERROR removing file", err)
        }
    }

    async deleteFileAndSerializeNewFile(file: any, service: any, data: { id: number, image_url?: string }, folder: string) {
        if (file) {
            this.deleteFile(service, data.id)   

            data = {
                ...data,
                image_url: this.serializeImageUrl(file.filename, folder)
            }
        }

        return data;
    }
}

export default FileService;