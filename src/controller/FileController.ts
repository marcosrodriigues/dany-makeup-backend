import FileService from "../services/FileService";
import { Request, Response } from "express";

const service = new FileService();

class FileController {
    async delete(request: Request, response: Response) {
        const { url } = request.body;

        try {
            await service.remove(url);
            return response.json({ status: 'Deleted', message: 'File deleted from system.'})
        } catch (error) {
            return response.json({ error });
        }
    }
}

export default FileController;