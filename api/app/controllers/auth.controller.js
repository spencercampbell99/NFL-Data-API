const db = require('../models');
const User = db.users;
const userController = require('../controllers/user.controller');
const authentication = require('../helpers/index').authentication;
const random = require('../helpers/index').random;
const jwt = require('jsonwebtoken');
const { generateToken, generateExpirationDate, handleDisplayableException } = require('../helpers/index');
const { access } = require('fs');
const DisplayableException = require('../exceptions/CustomExceptions').DisplayableException;

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
        const userExists = await userController._findByEmail(req.body.email, withPermissions = false);
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
            access_level: req.body.access_level ?? 'free',
        });

        const { token, authToken, sessionExpiration } = await _generateTokens(user, res);

        // Remove sensitive data from user object
        user.password = undefined;
        user.salt = undefined;

        return res.status(200).send({ message: 'User registered successfully!', user: user, token: token }).end();
    } catch (err) {
        console.error(err)
        err = handleDisplayableException(err);
        res.status(err.statusCode ?? 500).send({ message: err.message });
    }
}

async function _generateTokens(user, res) {
    // Generate JWT
    const token = jwt.sign({
        id: user.id,
        email: user.email,
        permissions: user.permissions,
        access_level: user.access_level,
    }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });

    // Generate a separate auth token
    const authToken = generateToken();
    const sessionExpiration = generateExpirationDate();

    // Set HTTP-only cookie
    res.cookie('ENDZONE-EDGE-JWT-USER', token, { httpOnly: true, maxAge: 3600000 });
    res.cookie('ENDZONE-EDGE-AUTH', authToken, { httpOnly: true });

    // Set session token and expiration
    await User.update({
        session_token: authToken,
        session_expiration: sessionExpiration,
    }, {
        where: { id: user.id },
    });

    return { token, authToken, sessionExpiration };
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

        let user = await userController._findByEmail(req.body.email, withPermissions = true);

        if (!user) {
            return res.status(404).send({ message: `User with email ${req.body.email} does not exist.` });
        }

        const encryptedPassword = authentication(user.salt, req.body.password);

        // if (encryptedPassword !== user.password) {
        //     return res.sendStatus(403); // FORBIDDEN
        // }

        const { token, authToken, sessionExpiration } = await _generateTokens(user, res);
        
        // Remove sensitive data from user object
        user.password = undefined;
        user.salt = undefined;

        return res.status(200).send({ message: 'User logged in successfully!', user: user, token: token });
    } catch (err) {
        console.log(err?.message);
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
        if (!req.cookies['ENDZONE-EDGE-AUTH']) {
            return res.status(400).send({ message: 'No session token found.' });
        }

        // clear session token and expiration
        await User.update({
            session_token: null,
            session_expiration: null,
        }, {
            where: { session_token: req.cookies['ENDZONE-EDGE-AUTH'] },
        });

        res.clearCookie('ENDZONE-EDGE-AUTH');
        res.clearCookie('ENDZONE-EDGE-JWT-USER');

        return res.status(200).send({ message: 'User logged out successfully!' }).end();
    } catch (err) {
        console.log(err?.message);
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
        const user = await userController._findBySessionToken(req.cookies['ENDZONE-EDGE-AUTH'], withPermissions = true);

        if (!user) {
            return res.sendStatus(401); // UNAUTHORIZED
        }

        // create JWT token
        const token = jwt.sign({
            id: user.id,
            email: user.email,
            permissions: user.permissions,
            access_level: user.access_level,
        }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });

        return res.status(200).send({ token })
    } catch (err) {
        console.log(err?.message);
        return res.status(500).send({ message: err.message });
    }
}