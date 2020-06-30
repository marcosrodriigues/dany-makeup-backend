import Knex from 'knex';

export async function up(knex: Knex) {
    return knex.schema.createTable('transactions', table => {
        table.increments('id').primary();
        table.string('pagarme_id');//": 1828542,

        table.string('status');//": "paid",
        table.string('authorization_code');//": "421974",
        table.string('soft_descriptor');//": null,
        table.integer('tid');//": 1828542,
        table.integer('nsu');//": 1828542,
        table.dateTime('date_created');//": "2017-08-14T17:35:40.242Z",
        table.dateTime('date_updated');//": "2017-08-14T17:47:07.370Z",
        table.integer('amount');//": 21000,
        table.integer('authorized_amount');//": 21000,
        table.string('postback_url');//": null,
        table.string('card_holder_name');//": "Morpheus Fishburne",
        table.string('card_last_digits');//": "1111",
        table.string('card_first_digits');//": "411111",
        table.string('card_brand');//": "visa",
        table.string('payment_method');//": "credit_card",
        table.string('capture_method');//": "ecommerce",
        table.string('antifraud_score');//": null,
        table.string('boleto_url');//": null,
        table.string('boleto_barcode');//": null,
        table.string('boleto_expiration_date');//": null,
    }); 
}

export async function down(knex: Knex) {
    return knex.schema.dropTable('transactions');
}