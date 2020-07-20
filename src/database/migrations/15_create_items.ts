import Knex from 'knex';
import { convertToDatabaseDate } from '../../util/util';

export async function up(knex: Knex) {
    return knex.schema.createTable('items', table => {
        table.increments('id').primary();

        table.string('name').notNullable();
        table.integer('quantity').notNullable()
        table.decimal('unit_price', 10, 2).notNullable();
        table.string('description');
        table.dateTime('created_at').defaultTo(convertToDatabaseDate(new Date()));

        table.integer('promotion_id').unsigned();
        table.integer('product_id').unsigned();

        table.foreign('promotion_id').references('promotions.id');
        table.foreign('product_id').references('products.id');
    }); 
}

export async function down(knex: Knex) {
    return knex.schema.dropTable('items');
}