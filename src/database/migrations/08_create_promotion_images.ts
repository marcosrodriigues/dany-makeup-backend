import Knex from 'knex';

export async function up(knex: Knex) {
    return knex.schema.createTable('promotion_images', table => {
        table.increments('id').primary();
        table.string('url').notNullable();
        table.integer('promotion_id').notNullable().unsigned();
        table.foreign('promotion_id').references('promotions.id').onDelete('cascade');
    });
}

export async function down(knex: Knex) {
    return knex.schema.dropTable('promotion_images');
}