import Knex from 'knex';
import { convertToDatabaseDate } from '../../util/util';

export async function up(knex: Knex) {
    return knex.schema.createTable('banners', table => {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.string('image_url').notNullable();
        table.dateTime('start').notNullable();
        table.dateTime('end').notNullable();
        table.string('description');
        table.dateTime('created_at').defaultTo(convertToDatabaseDate(new Date()));
        table.boolean('removed').defaultTo(false);
    });
}

export async function down(knex: Knex) {
    return knex.schema.dropTable('banners');
}