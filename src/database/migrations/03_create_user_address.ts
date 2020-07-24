import Knex from 'knex';

export async function up(knex: Knex) {
    return knex.schema.createTable('user_address', table => {
        table.increments('id').primary();
        
        table.integer('user_id').unsigned();
        table.integer('address_id').unsigned();

        table.foreign("user_id").references('users.id');
        table.foreign('address_id').references('address.id').onDelete('cascade')
    });
}

export async function down(knex: Knex) {
    return knex.schema.dropTable('user_address');
}