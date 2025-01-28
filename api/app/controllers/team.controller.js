const nflDb = require('../models').nfl;
const Team = nflDb.teams;
const { Op } = require("sequelize");
const getTemplateQuery = require('../helpers').getTemplateQuery;

// List teams
exports.list = async (req, res) => {
    try {
        const teams = await Team.findAll(
            {
                attributes: ['id', 'short_display_name'],
                order: [['short_display_name', 'ASC']]
            },
        );
        res.send(teams);
    } catch (err) {
        res.status(500).send({
            message: err.message || "An error occurred while retrieving teams."
        });
    }
};

/**
 * Get historical matchup details for given teams
 * 
 * @param {Object} req - request object
 * @param {Object} res - response object
 * @returns {Object} - response object
 * 
 * @example
 * historicalMatchups(req, res);
 */
exports.historicalMatchups = async (req, res) => {
    try {
        const team1 = req.query.team1;
        const team2 = req.query.team2;

        if (!team1 || !team2) {
            return res.status(400).send({
                message: "Both team1 and team2 are required."
            });
        }

        const page = req.query.page || 1;
        const startDate = req.query.start_date;
        const endDate = req.query.end_date;

        let whereClause = {
            team_id: team1,
            opponent_id: team2
        };

        console.log(startDate, endDate)

        if (startDate && endDate && startDate < endDate) {
            whereClause['$schedule.date$'] = {
                [Op.between]: [startDate, endDate]
            };
        }

        // find last 10 boxscore where team_id = team1 and opponent_id = team2
        let team1VsTeam2 = await nflDb.boxscores.findAll({
            where: whereClause,
            limit: 10,
            offset: (page - 1) * 10,
            attributes: ['team_id', 'opponent_id', 'points_scored', 'points_allowed', 'schedule_id', 'home_team', 'schedule_id'],
            include: [{
                model: nflDb.schedules,
                as: 'schedule',
                attributes: ['date'],
            },
            {
                model: Team,
                as: 'team',
                attributes: ['short_display_name', 'char_id', 'team_logo_wikipedia']
            },
            {
                model: Team,
                as: 'opponent',
                attributes: ['short_display_name', 'char_id', 'team_logo_wikipedia']
            }],
            order: [[nflDb.schedules, 'date', 'DESC']]
        });

        // convert into game object (i.e rename team/opponent into home/away team and points_scored/points_allowed into home/away points)
        team1VsTeam2 = team1VsTeam2.map((game) => {
            return game.home_team ? {
                id: game.schedule_id,
                home_team: {
                    char_id: game.team.char_id,
                    short_display_name: game.team.short_display_name,
                    team_logo_wikipedia: game.team.team_logo_wikipedia,
                },
                away_team: {
                    char_id: game.opponent.char_id,
                    short_display_name: game.opponent.short_display_name,
                    team_logo_wikipedia: game.opponent.team_logo_wikipedia,
                },
                home_score: game.points_scored,
                away_score: game.points_allowed,
                date: game.schedule.date,
            } : {
                id: game.schedule_id,
                home_team: {
                    char_id: game.opponent.char_id,
                    short_display_name: game.opponent.short_display_name,
                    team_logo_wikipedia: game.opponent.team_logo_wikipedia,
                },
                away_team: {
                    char_id: game.team.char_id,
                    short_display_name: game.team.short_display_name,
                    team_logo_wikipedia: game.team.team_logo_wikipedia,
                },
                home_score: game.points_allowed,
                away_score: game.points_scored,
                date: game.schedule.date,
            }
        });

        // return
        res.send(team1VsTeam2);
    } catch (err) {
        console.log(err?.message);
        res.status(500).send({
            message: err.message || "An error occurred while retrieving historical matchups."
        });
    }
}

/**
 * Get team by id
 * 
 * @param {Object} req - request object
 * @param {Object} res - response object
 * @returns {Object} - response object
 * 
 * @example
 * getTeamById(req, res);
 */
exports.getTeamById = async (req, res) => {
    try {
        const teamId = req.params.id;

        if (!teamId) {
            return res.status(400).send({
                message: "teamId is required."
            });
        }

        const team = await Team.findByPk(teamId);

        // return
        res.send(team);
    } catch (err) {
        res.status(500).send({
            message: err.message || "An error occurred while retrieving team."
        });
    }
}

/**
 * Get team schedule for season
 * 
 * @param {Object} req - request object
 * @param {Object} res - response object
 * @return {Object} - response object
 */
exports.getTeamScheduleForSeason = async (req, res) => {
    try {
        const teamId = req.params.id;
        const season = req.params.season;

        if (!teamId || !season) {
            return res.status(400).send({
                message: "teamId and season are required."
            });
        }

        const schedule = await nflDb.schedules.findAll({
            where: {
                season: season,
                [Op.or]: [
                    { home_team_id: teamId },
                    { away_team_id: teamId }
                ]
            },
            attributes: [
                'id', 'season', 'week', 'date', 'home_team_id', 'away_team_id', 'spread', 'home_moneyline', 'away_moneyline', 'over_under',
                'home_score', 'away_score', 'home_team_char_id', 'away_team_char_id', 'time'
            ],
            order: [['week', 'ASC']]
        });

        // return
        res.send(schedule);
    } catch (err) {
        console.log(err?.message)
        res.status(500).send({
            message: err.message || "An error occurred while retrieving team schedule."
        });
    }
}

/**
 * Get team's average performance going into given week and season
 * 
 * Given a team, week, season, and window (number of weeks back)
 * returns the average offense and defense performance for the team.
 * Does not include given week.
 * 
 * @param {Object} req - request object
 * @param {Object} res - response object
 * @return {Object} - response object
 */
exports.getTeamAveragePerformanceGoingIntoWeek = async (req, res) => {
    try {
        const teamId = req.params.id;
        const week = req.params.week;
        const season = req.params.season;
        const window = req.query.window || 5; // number of weeks back to check

        const query = getTemplateQuery({ filename: 'teams/TeamAveragesAtWeekWithWeeksBack.sql', replaceMapping: {':season': season, ':week': week, ':windowBack': window, ':teamId': teamId, ':limit': window + 1}, verbose: false });

        let averages = await nflDb
            .sequelize.query(query, {
                type: nflDb.sequelize.QueryTypes.SELECT,
                raw: true,
                logging: false
            });

        // get team info
        const team = await Team.findByPk(teamId);

        averages = averages[0] ?? {};

        // round all values to 1 decimal place
        for (const key in averages) {
            averages[key] = Math.round(averages[key] * 10) / 10;
        }

        averages['team'] = team;

        // return
        res.send(averages);
    } catch (err) {
        console.log(err?.message.message)
        res.status(500).send({
            message: err.message || "An error occurred while retrieving team averages."
        });
    }
}