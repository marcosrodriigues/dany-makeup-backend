import Knex from 'knex';
import { convertToDatabaseDate } from '../../util/util';

export async function up(knex: Knex) {
    return knex.schema.createTable('orders', table => {
        table.increments('id').primary();

        table.dateTime('created_at').defaultTo(convertToDatabaseDate(new Date()));
        

        table.decimal('price', 10,2);

        table.integer('user_id').unsigned().notNullable();
        table.integer('address_id').unsigned().notNullable();
        table.integer('transaction_id').unsigned();
        

        table.foreign('user_id').references('users.id');
        table.foreign('address_id').references('address.id');
        table.foreign('transaction_id').references('transactions.id').onDelete('cascade');
    }); 
}

export async function down(knex: Knex) {
    return knex.schema.dropTable('orders');
}