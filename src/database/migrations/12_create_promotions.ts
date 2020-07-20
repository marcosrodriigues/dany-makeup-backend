import Knex from 'knex';
import { convertToDatabaseDate } from '../../util/util';

export async function up(knex: Knex) {
    return knex.schema.createTable('promotions', table => {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.string('description');
        table.dateTime('start').notNullable();
        table.dateTime('end').notNullable();
        table.decimal('originalValue', 10, 2).notNullable();
        table.enum('discountType', ['R$', '%']).notNullable();
        table.decimal('discount', 10, 2).notNullable();
        table.decimal('promotionValue', 10, 2).notNullable();
        table.string('image_url').notNullable();
        table.boolean('removed').defaultTo(false);
        table.dateTime('created_at').defaultTo(convertToDatabaseDate(new Date()));
    });
}

export async function down(knex: Knex) {
    return knex.schema.dropTable('promotions');
}