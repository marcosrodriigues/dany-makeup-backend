import Knex from 'knex';

export async function up(knex: Knex) {
    return knex.schema.createTable('users', table => {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.string('email').notNullable();
        table.string('password');
        table.string('image');
        table.string('whatsapp');
        table.string('fb_id');
        table.boolean('removed').defaultTo(false);
    });
}

export async function down(knex: Knex) {
    return knex.schema.dropTable('users');
}