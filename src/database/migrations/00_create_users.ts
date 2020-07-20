import Knex from 'knex';
import { convertToDatabaseDate } from '../../util/util';

export async function up(knex: Knex) {
    return knex.schema.createTable('users', table => {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.string('email').notNullable();
        table.string('password');
        table.string('avatar');
        table.string('whatsapp');
        table.boolean('removed').defaultTo(false);
        table.dateTime('created_at').defaultTo(convertToDatabaseDate(new Date()));
        table.string('fb_id');
    });
}

export async function down(knex: Knex) {
    return knex.schema.dropTable('users');
}