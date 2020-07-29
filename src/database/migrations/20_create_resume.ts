import Knex from 'knex';

export async function up(knex: Knex) {
    return knex.schema.createTable('order_resume', table => {
        table.increments('id').primary();

        table.decimal('subtotal', 10, 2).notNullable();
        table.decimal('frete', 10, 2).notNullable();
        table.decimal('total', 10, 2).notNullable();

        table.integer('order_id').unsigned();
        table.foreign('order_id').references('orders.id').onDelete('cascade');
    }); 
}

export async function down(knex: Knex) {
    return knex.schema.dropTable('order_resume');
}