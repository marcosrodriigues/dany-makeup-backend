import path from 'path';

import StorageService from './StorageService';

const storage = new StorageService();
class FileService {
    async remove(url:string) {
        try {
            await storage.delete(url);
            return true;
        } catch (err) {
            throw err;
        }
    }

    getFilename(url: string) {
        return String(url).substring(String(url).lastIndexOf('/') + 1, url.length) 
    }

    getFolder(url: string) {
        const split = url.split('/uploads/')[1];
        return split.substring(0, split.indexOf('/'));
    }

    async serializeImageUrl(filename: string, folder: string) {
        const pathfile = path.resolve(__dirname, '..', '..', 'uploads', folder, filename);
        const url = this.upload(pathfile);
        return url;
    }

    async upload(file: string) {
        try {
            const url = await storage.store(file, this.getFolder(file));
            return url;
        } catch(err) {
            console.log('error', err);
            throw err;
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
            await this.deleteFile(service, data.id)   

            data = {
                ...data,
                image_url: await this.serializeImageUrl(file.filename, folder)
            }
        }

        return data;
    }
}

export default FileService;