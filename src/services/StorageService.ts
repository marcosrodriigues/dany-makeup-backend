import cloudinary from 'cloudinary';
import fs from 'fs';

class StorageService {
    async store(file: string) {
        try {
            const file_stream = fs.createReadStream(file);
            file_stream.on('error', function(err) {
                console.log('Error on readin file', err)
            })

            const up = await cloudinary.v2.uploader.upload(file);
            return up.secure_url;
        } catch(error) {
            throw error;
        }
    }

    async delete(file: string) {
        try {
            const filename = this.filename(file);
            const id = filename.split('.')[0];
            await cloudinary.v2.uploader.destroy(id);
            return true;
        } catch (err) {
            throw err;
        }
    }

    filename(url: string) {
        return String(url).substring(String(url).lastIndexOf('/') + 1, url.length) 
    }
}

export default StorageService;