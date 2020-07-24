import Knex from 'knex';
import { convertToDatabaseDate } from '../../util/util';

export async function up(knex: Knex) {
    return knex.schema.createTable('products', table => {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.decimal('value', 10, 2).notNullable();
        table.integer('amount').notNullable();
        table.string('image_url').notNullable();
        table.decimal('purchase_value', 10, 2);
        table.string('short_description');
        table.text('full_description');
        table.boolean('available').defaultTo(true);
        table.boolean('removed').defaultTo(false);
        table.dateTime('created_at').defaultTo(convertToDatabaseDate(new Date()));

        table.integer('manufacturer_id').unsigned();
        table.foreign('manufacturer_id').references('manufacturers.id');
    });
}

export async function down(knex: Knex) {
    return knex.schema.dropTable('products');
}