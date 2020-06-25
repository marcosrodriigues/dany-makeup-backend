import connection from "../database/connection";

class AddressService {
    async findByUser(id: number) {
        if (!id) throw "Not user provided!";
        try {
            const address = await connection('address')
                .join('users', 'users.id', 'address.user_id')
                .where('address.user_id', id)
                .select('address.*')
                .first();

            return address;
        } catch (err) {
            console.log('ERROR ADDRESS SERVICE - FIND BY USER');
            throw err;
        }
    }
}

export default AddressService;