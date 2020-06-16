import Knex from 'knex';

export async function up(knex: Knex) {
    return knex.schema.createTable('product_images', table => {
        table.increments('id').primary();
        table.string('url').notNullable();
        table.integer('product_id').notNullable().unsigned();
        table.foreign('product_id').references('products.id').onDelete('cascade');
    });
}

export async function down(knex: Knex) {
    return knex.schema.dropTable('product_images');
}