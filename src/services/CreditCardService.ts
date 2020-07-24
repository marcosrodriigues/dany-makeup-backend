import PagarMe from './PagarMe';
import ICreditCard from "../interface/ICreditCard";
import { convertToDatabaseDate } from '../util/util';
import { insert, select, buildConditions, remove}  from '../database/sqlBuilder';

const pagarMe = new PagarMe();

class CreditCardService {
    async save(data = { credit_card: {} as any, user_id: 0 as number,  }) {
        const { credit_card, user_id } = data;

        try {
            if (!(await this.verifyCreditCard(credit_card)))
                throw "Cartão de crédito inválido";

            const client = await pagarMe.connect() as any;
            const card_hash = await pagarMe.generateHash(credit_card, client);
            const pagarme_card = await pagarMe.generateCard(card_hash, client);
            const card = this.makeCard(pagarme_card);
            card.user_id = user_id;
            card.name = credit_card.name;
            card.expiration_date = credit_card.expiration_date;
            
            await insert('credit_cards', card);
            return { message: 'success' };
        } catch (err) {
            throw err;
        }
            
    }

    async find(params = { filter: { }, pagination: {} }) {
        const { filter, pagination } = params;

        const conditions = buildConditions({ filter });
        try {
            const options: any = {
                fields: [],
                conditions,
                pagination
            }
            const cards = await select('credit_cards', options);
            cards.map(card => {
                card.card_number = `${card.first_digits} ***** ${card.last_digits}`;
            });
            return cards;
        } catch (err) {
            throw err;
        }
    }

    async delete(id: number) {
        if (id === 0) throw 'No credit card provided';

        try {
            await remove('credit_cards', {
                conditions: [
                    ['id', '=', id]
                ]
            });

            return { message: 'success' }
        } catch (error) {
            throw error;
        }
    }

    async verifyCreditCard(credit_card: ICreditCard) {
        return (await pagarMe.isCreditCardValid(credit_card));
    }

    private makeCard(card_pagarme: any = undefined) {
        if (card_pagarme === undefined) return;
        
        const card: any = {
            card_id: card_pagarme.id,
            brand: card_pagarme.brand,
            holder_name: card_pagarme.holder_name,
            first_digits: card_pagarme.first_digits,
            last_digits: card_pagarme.last_digits,
            country: card_pagarme.country,
            fingerprint: card_pagarme.fingerprint,
            valid: card_pagarme.valid,
            date_updated: convertToDatabaseDate(new Date(card_pagarme.date_updated))
        }

        return card;
    }
}

export default CreditCardService;