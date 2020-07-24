import Knex from 'knex';
import { convertToDatabaseDate } from '../../util/util';

export async function up(knex: Knex) {
    return knex.schema.createTable('store_product', table => {
        table.increments('id').primary();

        table.integer('store_id').notNullable().unsigned();
        table.integer('product_id').notNullable().unsigned();
        table.integer('amount').defaultTo(0);
        table.dateTime('created_at').defaultTo(convertToDatabaseDate(new Date()));

        table.foreign('store_id').references('stores.id');
        table.foreign('product_id').references('products.id');
    });
}

export async function down(knex: Knex) {
    return knex.schema.dropTable('store_product');
}