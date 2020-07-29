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
    orderBy?: [string, string],
    conditions?: [[string, string, any]],
    orConditions?: [[string, string, any]],
    andConditions?: [[string, string, any]],
    inConditions?: [[string, any]],
    joins?: [[string, string, any]],
    leftJoins?: [[string, string, any]],
    rightJoins?: [[string, string, any]],
    pagination?: { limit: number, offset: number }
}
export const select = async (table: string, options: ISelectOptions) => {
    const { fields, orderBy, pagination,
        conditions, orConditions, andConditions, inConditions, 
        joins, leftJoins, rightJoins 
    } = options;
    const selected_fields = fields.length > 0 ? fields : `${table}.*`

    var query = connection(table)
        .distinct()
        .select(selected_fields)
        .where(builder => {
            conditions?.forEach(condition => {
                builder.orWhere(...condition)
            })  
        })

    joins?.forEach(join => {
        query.join(...join)
    });

    leftJoins?.forEach(join => {
        query.leftJoin(...join)
    });

    rightJoins?.forEach(join => {
        query.rightJoin(...join)
    });

    if (andConditions)
        query.where(builder => {
            andConditions.forEach(condition => {
                builder.andWhere(...condition)
            })  
        })

    if (orConditions)
        query.where(builder => {
            orConditions.forEach(condition => {
                builder.orWhere(...condition)
            })  
        })
    
    inConditions?.forEach(whereIn => {
        query.whereIn(...whereIn)
    })

    if (orderBy)
        query.orderBy(...orderBy)
        
    if (pagination)
        query.limit(pagination.limit).offset(pagination.offset)
    
    try {
        return await query;
    } catch (err) {
        throw err;
    }
}

export const count = async (table: string, options: ISelectOptions) => {
    const { conditions, orConditions, andConditions, joins, leftJoins, rightJoins } = options;
    
    var query = connection(table)
        .distinct()
        .countDistinct(`${table}.id`, { as: 'count' })
        .where(builder => {
            conditions?.forEach(condition => {
                builder.orWhere(...condition)
            })  
        });

    joins?.forEach(join => {
        query.join(...join)
    });

    leftJoins?.forEach(join => {
        query.leftJoin(...join)
    });

    rightJoins?.forEach(join => {
        query.rightJoin(...join)
    });

    if (andConditions)
        query.where(builder => {
            andConditions.forEach(condition => {
                builder.andWhere(...condition)
            })  
        })

    if (orConditions)
        query.where(builder => {
            orConditions.forEach(condition => {
                builder.orWhere(...condition)
            })  
        })
    
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
export const confirmRemove = async (table: string, options: IRemoveOptions) => {
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

export const buildConditions = (options: { filter: { }}, parentKey = ''): [[string, string, any]] => {
    const { filter } = options;

    const conditions = [];
    for (var obj of Object.entries(filter)){
        const [k, v] = obj;
        const isObject = typeof(v) === 'object';

        if (isObject) {
            const cond = buildConditions({ filter: Object(v) }, k)[0];
            if (cond !== undefined)
                conditions.push(cond);
        } else {
            const key = parentKey !== '' ? `${parentKey}.${k}` : k;

            const value : any = v
            if (!isNaN(value) && Number(value) !== 0)
                conditions.push([`${key}`, '=', Number(value)])

            if(value !== '')
                conditions.push([`${key}`, 'LIKE', `%${value}%`])
        }
    }
    return conditions as [[string, string, any]];
}
