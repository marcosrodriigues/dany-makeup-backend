import Knex from 'knex';

export async function up(knex: Knex) {
    return knex.schema.createTable('promotion_product', table => {
        table.increments('id').primary();

        table.integer('promotion_id').notNullable().unsigned();
        table.foreign('promotion_id').references('promotions.id')

        table.integer('product_id').notNullable().unsigned();
        table.foreign('product_id').references('products.id');
    });
}

export async function down(knex: Knex) {
    return knex.schema.dropTable('promotion_product');
}