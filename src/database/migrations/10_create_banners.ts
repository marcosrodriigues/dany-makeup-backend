import Knex from 'knex';

export async function up(knex: Knex) {
    return knex.schema.createTable('banners', table => {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.string('description');
        table.dateTime('start').notNullable();
        table.dateTime('end').notNullable();
        table.string('image_url').notNullable();
        table.boolean('removed').defaultTo(false);
    });
}

export async function down(knex: Knex) {
    return knex.schema.dropTable('banners');
}