import Knex from 'knex';

export async function up(knex: Knex) {
    return knex.schema.createTable('promotions', table => {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.dateTime('start').notNullable();
        table.dateTime('end').notNullable();
        table.decimal('originalValue', 10, 2).notNullable();
        table.string('discountType').notNullable();
        table.decimal('discount', 10, 2).notNullable();
        table.decimal('promotionValue', 10, 2).notNullable();
        table.string('mainImage').notNullable();
        table.boolean('removed').defaultTo(false);
    });
}

export async function down(knex: Knex) {
    return knex.schema.dropTable('promotions');
}