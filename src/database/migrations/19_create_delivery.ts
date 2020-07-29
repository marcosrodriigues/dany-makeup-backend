import Knex from 'knex';
import { convertToDatabaseDate } from '../../util/util';

export async function up(knex: Knex) {
    return knex.schema.createTable('delivery', table => {
        table.increments('id').primary();

        table.string('code').notNullable();
        table.string('name').notNullable();
        table.decimal('value', 10,2).defaultTo(0);
        table.integer('deadline').defaultTo(0);
        table.string('cep');

        table.integer('store_id').unsigned();
        table.foreign('store_id').references('stores.id');

        table.integer('order_id').unsigned();
        table.foreign('order_id').references('orders.id').onDelete('cascade');
    }); 
}

export async function down(knex: Knex) {
    return knex.schema.dropTable('delivery');
}