import bcryptjs from 'bcryptjs'

const salt = 10;

class Crypto {
    async encrypt(text: string) {
        var encrypted = await bcryptjs.hash(text, salt);
        return encrypted;
    }
    async compare(password: string, encrypted: string) {
        try {
            var equal = await bcryptjs.compare(password, encrypted).then(value => {
                return value;
            });
            return equal;
        } catch (err) {
            throw err;
        }
        
    }
}

export default Crypto