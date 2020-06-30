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
    conditions: [[string, string, any]]
}
export const select = async (table: string, options: ISelectOptions) => {
    const { fields, conditions } = options;
    const selected_fields = fields.length > 0 ? fields : '*'
    try {
        return await connection(table)
            .select(selected_fields)
            .andWhere(builder => {
                conditions.forEach(condition => {
                    builder.where(...condition)
                })
            })
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