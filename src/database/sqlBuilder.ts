import connection from './connection';

export const insert = async (table: string, data: {}) => {
    try {
        return await connection(table)
            .insert(data)
    } catch (err) {
        throw err;
    }
}

interface ISelectOptions {
    fields: [],
    conditions: [[string, string, any]],
    joins?: [[string, string, any]],
    pagination?: { limit: number, offset: number }
}
export const select = async (table: string, options: ISelectOptions) => {
    const { fields, conditions, joins, pagination } = options;
    const selected_fields = fields.length > 0 ? fields : '*'

    var query = connection(table)
        .distinct()
        .select(selected_fields)
        .where(builder => {
            conditions.forEach(condition => {
                builder.orWhere(...condition)
            })  
        })

    joins?.forEach(join => {
        query.join(...join)
    });

    if (pagination)
        query.limit(pagination.limit).offset(pagination.offset)
    
    try {
        return await query;
    } catch (err) {
        throw err;
    }
}

export const count = async (table: string, options: ISelectOptions) => {
    const { conditions, joins } = options;

    var query = connection(table)
        .distinct()
        .count(`${table}.id`, { as: 'count' })
        .where(builder => {
            conditions.forEach(condition => {
                builder.orWhere(...condition)
            })  
        });

    joins?.forEach(join => {
        query.join(...join)
    });
    
    try {
        return await query;
    } catch (err) {
        throw err;
    }
}

interface IUpdateOptions {
    data: {}
    conditions: [[string, string, any]]
}
export const update = async (table: string, options: IUpdateOptions) => {
    const { data, conditions } = options;
    try {
        return await connection(table)
            .where(builder => {
                conditions.forEach(condition => {
                    builder.where(...condition)
                })
            })
            .update(data)
    } catch (err) {
        throw err;
    }
}

interface IRemoveOptions {
    conditions: [[string, string, any]]
}
export const remove = async (table: string, options: IRemoveOptions) => {
    const { conditions } = options;

    try {
        return await connection(table)
            .where(builder => {
                conditions.forEach(condition => {
                    builder.where(...condition)
                })
            })
            .del()
    } catch(err) {
        throw err;
    }
}

export const buildConditions = (options: { filter: { }}) => {
    const { filter } = options;

    const conditions = [];
    for (var [key, v] of Object.entries(filter)){
        const value : any = v
        if (!isNaN(value) && Number(value) !== 0)
            conditions.push([`${key}`, '=', Number(value)])

        if(value !== '')
            conditions.push([`${key}`, 'LIKE', `%${value}%`])
    }

    return conditions;
}