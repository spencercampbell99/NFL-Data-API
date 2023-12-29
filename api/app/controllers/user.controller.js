const db = require('../models');
const User = db.users;

// TODO Swap controller exported functions over to using req, res and incude route name in docblocks

/**
 * Find user by id
 * 
 * @param {number} id - The user id.
 * 
 * @returns {User}
 * @throws {Error} If there is an error while retrieving the user.
 * 
 * @example
 * // Returns the user with the id
 * const user = await userController.find(id);
 */
exports._find = async (id) => {
    try {
        const user = await User.findByPk(id);
        return user;
    } catch (err) {
        console.log(err);
        return null;
    }
}

/**
 * Find user by session token
 * 
 * @param {string} sessionToken - The session token.
 * 
 * @returns {User}
 * @throws {Error} If there is an error while retrieving the user.
 * 
 * @example
 * // Returns the user with the session token
 * const user = await userController.findBySessionToken(sessionToken);
 */
exports._findBySessionToken = async (sessionToken) => {
    try {
        const user = await User.findOne({
            where: {
                session_token: sessionToken,
            },
        });
        return user;
    } catch (err) {
        console.log(err);
        return null;
    }
}

/**
 * Get all users
 * 
 * @returns {User[]}
 * @throws {Error} If there is an error while retrieving users.
 * 
 * @api {get} /api/users Get all users
 */
exports.list = async (req, res) => {
    try {
        const users = await User.findAll();
        
        return res.status(200).send(users);
    } catch (err) {
        console.log(err);
        return null;
    }
}