import Knex from 'knex';

export async function up(knex: Knex) {
    return knex.schema.createTable('manufacturers', table => {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.string('image_url').notNullable();
        table.text('description').notNullable();
        table.boolean('removed').defaultTo(false);
    });
}

export async function down(knex: Knex) {
    return knex.schema.dropTable('manufacturers');
}