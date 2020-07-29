import { select } from "../database/sqlBuilder";

class ResumeService {
    async findByOrder(order_id: number) {
        if (order_id === 0) throw "No Order provided";

        try {
            const resume = (await select('order_resume', {
                fields: [],
                conditions: [
                    ['order_id', '=', order_id]
                ]
            }))[0];
            return resume;
        } catch (error) {
            throw error;
        }
    }
}

export default ResumeService;