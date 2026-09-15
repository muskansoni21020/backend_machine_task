const sequelize = require('./db');

const executeQuery = async (query, params, queryType) => {
    try {
        const result = await sequelize.query(query, {
replacements: params,
type: queryType,
        });
        return result;
    } catch (err) {
        throw err;
    }
}

module.exports = {
    executeQuery,
}