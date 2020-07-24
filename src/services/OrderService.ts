import { buildConditions, count, select } from "../database/sqlBuilder";
import { isOrderValid } from "../util/util";
import connection from "../database/connection";

class OrderService {
    async find(params = { filter: { }, pagination: {} }) {
        const { filter, pagination } = params;
        
        const conditions = buildConditions({ filter });

        try {
            const options: any  = {
                fields: ['*'],
                conditions,
                pagination
            }
            const result = await select('orders', options);
            const counter = await count('orders', options);

            return { orders: result , count: counter[0].count  };
        } catch (err) {
            throw err;
        }
    }

    async findOne(id: number) {
        if (id <= 0) return undefined;

        try {
            const order = (await select('orders', {
                fields: [],
                conditions: [['id', '=', id]]
            }))[0];
            return order;
        } catch (err) {
            throw err;
        }
    }

    async store(data: any ) {
        const { order } = data;
        if (!isOrderValid(order)) {
            throw "!ORDER INVALID!";
        }
        const { user, payment, purchase } = order;

        console.log(order);

       /**
         * cadastro todos os itens no banco de dados e removo a quantidade do estoque
         * crio o pedido do usuário, onde terão os itens e o id do usuário
         *  pedido do usuario vai ter: lista de itens, o frete, usuário
         * separo os dados da transação e envio pro pagarme
         */
        try {
            //const trx = await connection.transaction();
            //crio a order com o user_id e o address_id
            //crio todos os itens da order e calculo o valor final da order
            //cadastro a transação no banco de dados
            //atribuo o valor total pro order
            //atribuo o id da transação pro order
            //salvo o order no banco
            //tento executar a cobrança
            //retorno
            //const items_id = await trx('orders', )
        } catch (error) {
            throw error;
        }
    }

    async update() {

    }
}

export default OrderService;
