
import PagarMe from './PagarMe';
import { insert, select } from '../database/sqlBuilder'
import { convertToDatabaseDate } from '../util/util';

const PagarME = new PagarMe();

class TransactionService {
    async store(order: any) {
        const { user, purchase } = order;
        const pay = order.payment;
        const { items, delivery, resume } = purchase;
        const { payment, address } = pay;
        payment.amount = resume.total;

        const transaction = 
            payment.payment_method === 'credit_card' ? 
                this.makeCreditCard(payment) :
                this.makeBoleto(payment);

        if (payment.payment_method === 'boleto') {
            user.birthday = this.FormataStringData(payment.boleto.birthday) || '';
            user.cpf = payment.boleto.cpf || '';
        }

        transaction.amount = this.convertToCents(resume.total);
        transaction.customer = this.makeCustomer(user);
        transaction.billing = this.makeBilling(address);
        transaction.shipping = this.makeShipping(address, delivery);
        transaction.items = this.makeItems(items);
        
        try {
            const created = await PagarME.makeTransaction(transaction);
            
            const db_transaction = {
                pagarme_id: created.id,
                status: created.status,
                authorization_code: created.authorization_code,
                soft_descriptor: created.soft_description,
                tid: created.tid,
                nsu: created.nsu,
                date_created: convertToDatabaseDate(created.date_created),
                date_updated: convertToDatabaseDate(created.date_updated),
                amount: created.amount,
                authorized_amount: created.authorized_amount,
                payment_method: created.payment_method,
                boleto_url: created.boleto_url,
                boleto_barcode: created.boleto_barcode,
                boleto_expiration_date: created.boleto_expiration_date,
                postback_url: created.postback_url,
                card_name: payment.credit_card.name,
                card_holder_name: created.card_holder_name,
                card_last_digits: created.card_last_digits,
                card_first_digits: created.card_first_digits,
                card_brand: created.card_brand
            }

            return await this.save(db_transaction);
        } catch(error) {
            console.log('ERROR MAKING TRANSACTION ', transaction)
            try {
                const db_transaction = {
                    status: 'pending',
                    date_created: convertToDatabaseDate(new Date()),
                    amount: transaction.amount,
                    payment_method: payment.payment_method,
                    card_name: payment.credit_card.name,
                    card_holder_name: payment.credit_card.card_holder_name,
                    card_last_digits: payment.credit_card.card_last_digits,
                    card_first_digits: payment.credit_card.card_first_digits,
                }
                return await this.save(db_transaction);
            } catch (error_db) {
                console.log('ERROR SAVING TRANSACTION FAILURE TO DATABASE', error_db)
                throw error_db;
            }
        }
    }

    async save(transaction: any) {
        try {  
            const id = (await insert('transactions', transaction))[0];
            return id;
        } catch (error) {
            throw error;
        }
    }
    private convertToCents(value: any) {
        return Number(Number(value).toFixed(2).replace('.', ''));
    }

    async findById(id: number) {
        if (id === 0) throw 'NO TRANSACTION PROVIDED';

        try {
            const transaction = (await select('transactions', {
                fields: [],
                conditions: [
                    ['id', '=', id]
                ]
            }))[0]

            return transaction;
        } catch (err) {
            throw err;
        }
    }

    private makeCustomer(user: any) {
        const cpf = user.cpf?.replace('.', '').replace('.', '').replace('-', '') || '66680137080'
        const phone = user.whatsapp?.replace('(', '').replace(')', '').replace('-', '').trim() || '+5548999359779'

        const customer = {
            external_id: String(user.id),
            name: user.name,
            type: 'individual', 
            country: 'br',
            email: user.email,

            documents: [{
                type: 'cpf',
                number: cpf
            }],
            phone_numbers: [
                phone
            ],
            birthday: user.birthday
        }

        return customer;
    }

    private makeItems(items: any[]) {
        let purch_items: any = [];
        items.map(item => {
            purch_items.push({
                id: String(item.id),
                title: item.name,
                unit_price: this.convertToCents(item.value),
                quantity: item.amount,
                tangible: true
            })
        })

        return purch_items;
    }

    private makeCreditCard(payment: any) {
        const transaction: any = {
            payment_method: payment.payment_method,
            async: false,
            installments: 1,
            soft_descriptor: 'DanyMakeUpApp',
            card_id: payment.credit_card.card_id
        };

        return transaction;
    }

    private makeBilling(address: any) {
        const billing = {
            name: address.name,
            address: {
                country: address.country || 'br',
                state: address.uf,
                city: address.city,
                neighborhood: address.neighborhood,
                street: address.street,
                street_number: address.number,
                zipcode: address.cep.replace('-', ''),
            }
        }

        return billing;
    }

    private makeShipping(address: any, delivery: any) {
        const shipping = {
            name: address.name,
            fee: this.convertToCents(delivery.value),
            address: {
                country: address.country || 'br',
                state: address.uf,
                city: address.city,
                neighborhood: address.neighborhood,
                street: address.street,
                street_number: address.number,
                zipcode: address.cep.replace('-', ''),
            }
        }

        return shipping;
    }

    private makeBoleto(payment: any) {
        const boleto = {
            payment_method: payment.payment_method,
            soft_descriptor: 'Dany MakeUp App',
            card_id: payment.credit_card.card_id,

        }

        return boleto;
    }
    private FormataStringData(data: any) {
        var dia  = data.split("/")[0];
        var mes  = data.split("/")[1];
        var ano  = data.split("/")[2];
      
        return ano + '-' + ("0"+mes).slice(-2) + '-' + ("0"+dia).slice(-2);
        // Utilizo o .slice(-2) para garantir o formato com 2 digitos.
      }
}

export default TransactionService;