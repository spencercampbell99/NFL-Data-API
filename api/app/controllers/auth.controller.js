const db = require('../models');
const User = db.users;
const userController = require('../controllers/user.controller');
const authentication = require('../helpers/index').authentication;
const random = require('../helpers/index').random;
const generateToken = require('../helpers/index').generateToken;
const generateExpirationDate = require('../helpers/index').generateExpirationDate;

/**
 * Registers a new user.
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} The response object with a success message and the registered user.
 * @throws {Error} If there is an error during the registration process.
 */
exports.register = async (req, res) => {
    try {
        // check that password is present
        if (!req.body.password || req.body.password.length < 8 || !req.body.email || !req.body.username) {
            return res.status(400).send({ message: 'Username, email, and password are required. Password must be 8+ characters.' });
        }

        // check that user doesn't already exist
        const userExists = await userController._findByEmail(req.body.email);
        if (userExists) {
            return res.status(400).send({ message: `User with email ${req.body.email} already exists.` });
        }

        const password = req.body.password;
        const salt = random();

        const encryptedPassword = authentication(salt, password);

        const user = await User.create({
            username: req.body.username,
            password: encryptedPassword,
            salt: salt,
            email: req.body.email,
            first_name: req.body.first_name,
            last_name: req.body.last_name,
        });

        // drop password and salt from response
        user.password = undefined;
        user.salt = undefined;

        return res.status(200).send({ message: 'User registered successfully!', user: user }).end();
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: err.message });
    }
}

/**
 * Logs in a user.
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} The response object with a success message and the logged-in user.
 * @throws {Error} If there is an error during the login process.
 */
exports.login = async (req, res) => {
    try {
        // check that email and password are present
        if (!req.body.email || !req.body.password) {
            return res.status(400).send({ message: 'Email and password are required.' });
        }

        let user = await userController._findByEmail(req.body.email);

        if (!user) {
            return res.status(404).send({ message: `User with email ${req.body.email} does not exist.` });
        }

        const encryptedPassword = authentication(user.salt, req.body.password);

        if (encryptedPassword !== user.password) {
            return res.sendStatus(403); // FORBIDDEN
        }

        const sessionToken = generateToken();
        const sessionExpiration = generateExpirationDate();

        await User.update({
            session_token: sessionToken,
            session_expiration: sessionExpiration,
        }, {
            where: { id: user.id },
        });

        // remove sensitive data from user object
        user.password = undefined;
        user.salt = undefined;
        user.session_expiration = undefined
        user.session_token = undefined

        res.cookie('SHHBETS-AUTH', sessionToken, { expires: sessionExpiration, httpOnly: true })
        return res.status(200).send({ message: 'User logged in successfully!', user: user }).end();
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: err.message });
    }
}

/**
 * Logs out a user.
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} The response object with a success message.
 * @throws {Error} If there is an error during the logout process.
 */
exports.logout = async (req, res) => {
    try {
        if (!req.cookies['SHHBETS-AUTH']) {
            return res.status(400).send({ message: 'No session token found.' });
        }

        // clear session token and expiration
        await User.update({
            session_token: null,
            session_expiration: null,
        }, {
            where: { session_token: req.cookies['SHHBETS-AUTH'] },
        });

        res.clearCookie('SHHBETS-AUTH');

        return res.status(200).send({ message: 'User logged out successfully!' }).end();
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: err.message });
    }
}

/**
 * Gets the current user.
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} The response object with the current user.
 * @throws {Error} If there is an error during the process of getting the current user.
 */
exports.me = async (req, res) => {
    try {
        const user = await userController._findBySessionToken(req.cookies['SHHBETS-AUTH']);

        if (!user) {
            return res.sendStatus(403); // FORBIDDEN
        }

        console.log('made it here');

        return res.status(200).send({ user: user }).end();
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: err.message });
    }
}