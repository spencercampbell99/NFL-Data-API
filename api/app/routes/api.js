const express = require('express');
const router = express.Router();
const app = express();
const Team = require('../models/team.model');

router.get('/', (req, res) => {
    res.send('Hello World!');
});

router.post('/teams', express.json(), (req, res) => {
    // get post data
    const teams = req.body;

    console.log(teams);

    // create the new teams
    Team.bulkCreate(teams, (err, newTeams) => {
        if (err) {
            console.log(err?.message);
            res.sendStatus(500);
        } else {
            res.send(newTeams);
        }
    });    
});

module.exports = router; 