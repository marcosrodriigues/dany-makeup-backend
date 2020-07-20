import Knex from 'knex';
import { convertToDatabaseDate } from '../../util/util';

export async function up(knex: Knex) {
    return knex.schema.createTable('credit_cards', table => {
        table.increments('id').primary();
        table.string('name');
        table.string('card_id');
        table.string('brand').notNullable();
        table.string('holder_name').notNullable();
        table.string('first_digits').notNullable();
        table.string('last_digits').notNullable();
        table.string('country');
        table.string('fingerprint');
        table.boolean('valid');
        table.string('expiration_date').notNullable();
        table.dateTime('date_created').defaultTo(convertToDatabaseDate(new Date()));
        table.dateTime('date_updated');

        table.integer('user_id').unsigned().notNullable();
        table.foreign('user_id').references('users.id').onDelete('cascade')

    });
}

export async function down(knex: Knex) {
    return knex.schema.dropTable('credit_cards');
}