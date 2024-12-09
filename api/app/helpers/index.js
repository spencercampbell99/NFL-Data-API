const crypto = require('crypto');

/**
 * Generates a random token.
 * 
 * @returns {string} The generated token.
 */
exports.generateToken = () => {
    return crypto.randomBytes(20).toString('hex');
}

/**
 * Generates a token expiration date.
 * 
 * @param {number} timeFromNow - The time from now in milliseconds.
 * 
 * @returns 
 */
exports.generateExpirationDate = (timeFromNow = 36000000) => {
    return new Date(Date.now() + 3600000);
}

/**
 * Generates a random string.
 * 
 * @returns {string} The generated string.
 */
exports.random = () => {
    return crypto.randomBytes(128).toString('base64');
}

/**
 * Authenticates a password.
 * 
 * @param {*} salt 
 * @param {*} password 
 * @returns 
 */
exports.authentication = (salt, password) => {
    return crypto.createHmac('sha256', [salt, password].join(':')).update(process.env.SECRET_KEY).digest('hex');
}

/**
 * Return formatted query from saved sql queries.
 * 
 * @param {string} filename - The filename.
 * @param {object} replaceMapping - The replace mapping.
 * 
 * @returns {string} The formatted query.
 */
exports.getTemplateQuery = (filename, replaceMapping) => {
    const fs = require('fs');
    const path = require('path');
    let sql = fs.readFileSync(path.join(__dirname, `../sql/${filename}`)).toString();
    
    for (let key in replaceMapping) {
        sql = sql.replace(key, replaceMapping[key]);
    }

    return sql;
}