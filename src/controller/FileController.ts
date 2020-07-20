import FileService from "../services/FileService";
import { Request, Response } from "express";

const service = new FileService();

class FileController {
    async delete(request: Request, response: Response) {

        const { url } = request.body;

        await service.remove(url);

        return response.json({ status: 'Deleted', message: 'File deleted from system.'})
    }
}

export default FileController;