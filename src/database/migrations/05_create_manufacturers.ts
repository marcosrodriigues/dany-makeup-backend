import Knex from 'knex';
import { convertToDatabaseDate } from '../../util/util';

export async function up(knex: Knex) {
    return knex.schema.createTable('manufacturers', table => {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.string('image_url').notNullable();
        table.text('description').notNullable();
        table.boolean('removed').defaultTo(false);
        table.dateTime('created_at').defaultTo(convertToDatabaseDate(new Date()));
    });
}

export async function down(knex: Knex) {
    return knex.schema.dropTable('manufacturers');
}