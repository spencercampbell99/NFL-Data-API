const { get, merge } = require('lodash');
const findBySessionToken = require('../controllers/user.controller')._findBySessionToken;

/**
 * Checks that a user is authenticated.
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Function} The next middleware function.
 * @throws {Error} If there is an error during the authentication process.
 */
exports.isAuthenticated = async (req, res, next) => {
    try {
        const sessionToken = req.cookies['SHHBETS-AUTH']

        if (!sessionToken) {
            return res.status(401).send({ message: 'Unauthorized token' });
        }

        const user = await findBySessionToken(sessionToken);
        if (!user) {
            return res.status(401).send({ message: 'Unauthorized user' });
        }
        
        merge(req, { user: user });

        return next();
    } catch (err) {
        console.log(err?.message);
        return res.status(500).send({ message: err.message });
    }
}

/**
 * Checks that requesting user owns the resource.
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * 
 * @returns {Function} The next middleware function.
 * @throws {Error} If there is an error during the authorization process.
 */
// exports.isOwner = async (req, res, next) => {
//     try {
//         const userId = get(req, 'user.id');
//         const paramId = get(req, 'params.id');
//         if (userId !== paramId) {
//             return res.status(403).send({ message: 'Forbidden' });
//         }

//         return next();
//     } catch (err) {
//         console.log(err?.message);
//         return res.status(500).send({ message: err.message });
//     }
// }