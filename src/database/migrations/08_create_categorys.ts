import Knex from 'knex';
import { convertToDatabaseDate } from '../../util/util';

export async function up(knex: Knex) {
    return knex.schema.createTable('categorys', table => {
        table.increments('id').primary();
        table.string('title').notNullable();
        table.string('description');
        table.string('image_url').notNullable();
        table.boolean('removed').defaultTo(false);
        table.dateTime('created_at').defaultTo(convertToDatabaseDate(new Date()));
    });
}

export async function down(knex: Knex) {
    return knex.schema.dropTable('categorys');
}