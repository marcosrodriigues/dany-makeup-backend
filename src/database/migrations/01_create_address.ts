import Knex from 'knex';

export async function up(knex: Knex) {
    return knex.schema.createTable('address', table => {
        table.increments('id').primary();
        table.string('logradouro').notNullable();
        table.string('numero');
        table.string('bairro').notNullable();
        table.string('cidade').notNullable();
        table.string('uf', 2).notNullable();

        table.integer('user_id').notNullable().unsigned();
        table.foreign('user_id').references('users.id')
    });
}

export async function down(knex: Knex) {
    return knex.schema.dropTable('enderecos');
}