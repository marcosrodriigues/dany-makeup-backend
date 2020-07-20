import Knex from 'knex';

export async function up(knex: Knex) {
    return knex.schema.createTable('category_product', table => {
        table.increments('id').primary();

        table.integer('category_id').notNullable().unsigned();
        table.integer('product_id').notNullable().unsigned();
        
        table.foreign('category_id').references('categorys.id')
        table.foreign('product_id').references('products.id');
    });
}

export async function down(knex: Knex) {
    return knex.schema.dropTable('category_product');
}