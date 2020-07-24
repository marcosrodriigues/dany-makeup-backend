import pagarme from 'pagarme';

import ICreditCard from '../interface/ICreditCard';

const API_KEY = process.env.PAGARME_API_KEY;

class PagarMe {
    async generateHash(credit_card: ICreditCard, cliente = undefined) {
        const card = this.makeCard(credit_card);
        try {
            const client = cliente || await this.connect();
            const card_hash = await client.security.encrypt(card);
            return card_hash;
        } catch (err) {
            throw err;
        }
    }
    async generateCard(card_hash = '', cliente = undefined) {
        if (card_hash === '' || cliente === undefined) throw ":generateCardId: Parameter invalid"
        try {
            const client = cliente || await this.connect();
            const card_id = await client.cards.create({
                api_key: API_KEY, 
                card_hash
            });
            return card_id;
        } catch (err) {
            console.log('ERROR GENERATE CARD ID')
            console.log(JSON.stringify(err.response))
            throw err;
        }
    }

    async connect() {
        try {
            const client = await pagarme.client.connect({
                api_key: API_KEY
            });

            return client;
        } catch (err) {
            console.log('ERROR PAGARME SERVICE CONNECT', err);
            throw err;
        }
    }
    
    async isCreditCardValid(credit_card: ICreditCard) {
        if (
            credit_card.holder_name === '' ||
            credit_card.expiration_date === '' ||
            credit_card.card_number === '' ||
            credit_card.card_cvv === ''
        ) return false;
    
        const card = this.makeCard(credit_card);

        try {
            const card_validation = await pagarme.validate({ card })

            if (!card_validation.card.card_holder_name || 
                !card_validation.card.card_number || 
                !card_validation.card.card_expiration_date || 
                !card_validation.card.card_cvv)
                    return false;

            return card;
        } catch (err) {
            throw err;
        }
    }

    private makeCard(credit_card: ICreditCard) {
        const card = {
            card_holder_name: credit_card.holder_name,
            card_expiration_date: credit_card.expiration_date,
            card_number: credit_card.card_number,
            card_cvv: credit_card.card_cvv
        };

        return card;
    }

    async makeTransaction() {
        
    }
}

export default PagarMe;