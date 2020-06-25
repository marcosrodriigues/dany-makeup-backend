import Knex from 'knex';

export async function up(knex: Knex) {
    return knex.schema.createTable('address', table => {
        table.increments('id').primary();
        table.string('name');
        table.string('cep');
        table.string('street').notNullable();
        table.string('number');
        table.string('neighborhood');
        table.string('reference');
        table.string('complement');
        table.string('city').notNullable();
        table.string('uf', 2).notNullable();

        table.integer('user_id').notNullable().unsigned();
        table.foreign('user_id').references('users.id').onDelete('cascade');
    });
}

export async function down(knex: Knex) {
    return knex.schema.dropTable('enderecos');
}