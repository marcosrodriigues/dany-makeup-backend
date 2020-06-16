import Knex from 'knex';

export async function up(knex: Knex) {
    return knex.schema.createTable('products', table => {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.decimal('value', 10, 2).notNullable();
        table.integer('amount').notNullable();
        table.boolean('available').notNullable();
        table.string('mainImage').notNullable();
        table.string('shortDescription');
        table.text('fullDescription');
        table.boolean('removed').defaultTo(false);

        table.integer('manufacturer_id').unsigned();
        table.foreign('manufacturer_id').references('manufacturers.id');
    });
}

export async function down(knex: Knex) {
    return knex.schema.dropTable('products');
}