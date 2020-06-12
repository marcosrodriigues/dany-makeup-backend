import Knex from 'knex';

export async function up(knex: Knex) {
    return knex.schema.createTable('categorys', table => {
        table.increments('id').primary();
        table.string('title').notNullable();
        table.string('image_url').notNullable();
        table.boolean('available').notNullable();
    });
}

export async function down(knex: Knex) {
    return knex.schema.dropTable('categorys');
}