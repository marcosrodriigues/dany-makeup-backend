import Knex from 'knex';
import { convertToDatabaseDate } from '../../util/util';

export async function up(knex: Knex) {
    return knex.schema.createTable('stores', table => {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.string('description');
        table.string('image_url').notNullable();
        table.boolean('removed').defaultTo(false);
        table.dateTime('created_at').defaultTo(convertToDatabaseDate(new Date()));

        table.integer('address_id').unsigned().notNullable();
        table.foreign('address_id').references('address.id').onDelete('cascade')
    });
}

export async function down(knex: Knex) {
    return knex.schema.dropTable('stores');
}