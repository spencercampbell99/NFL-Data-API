const nflDb = require('../models').nfl;
const Schedule = nflDb.schedules;
const PlayerGameStat = nflDb.playerGameStats;

/**
 * Find game by id
 * @param {number} id - The game id.
 * @returns {Schedule}
 */
exports.find = async (id) => {
    try {
        const game = await Schedule.findByPk(id);
        return game;
    } catch (err) {
        console.log(err);
        return null;
    }
}

/**
 * Get games by week and season
 * @param {number} week - The week number.
 * @param {number} season - The season.
 * @param {boolean} idsOnly - Whether to return just the ids or the full game objects.
 * @param {boolean} withModelPredictions - Whether to include model predictions.
 * @returns {[Schedule]}
 */
exports.getGamesBySeasonAndWeek = async ({ week, season, idsOnly = true, withModelPredictions = false }) => {
    try {
        let query = {
            where: {
                week: week,
                season: season,
            },
            attributes: idsOnly ? ['id', 'espn_id'] : undefined
        }

        if (withModelPredictions) {
            query.include = [
                {
                    model: nflDb.modelPredictions,
                    as: 'model_predictions',
                    attributes: ['home_team_score', 'away_team_score', 'total_score', 'over_under', 'cover_spread', 'home_win', 'underdog_win', 'suggested_moneyline_percent_bet', 'correct_winner'],
                }
            ]
        }

        const games = await Schedule.findAll(query);
        return games;
    } catch (err) {
        console.log(err);
        return null;
    }
}

/**
 * Get overview of games by week and season for display.
 * 
 * @api {get} /api/games/overview/:season/:week Get overview of games by week and season for display
 * @apiName GetGamesOverviewBySeasonAndWeek
 * @apiGroup Game
 * @apiPermission none
 * 
 * @apiParam {number} season - The season.
 * @apiParam {number} week - The week number.
 * 
 * @apiSuccess {object[]} data.games - The games.
 * 
 * @returns {object}
 */
exports.getGamesOverviewBySeasonAndWeek = async (req, res) => {
    try {
        const season = req.params.season;
        const week = req.params.week;

        if (!season || !week) {
            return res.status(400).send({
                message: 'Season and week are required.',
            });
        }

        const includeBetLines = req.query.includeBetLines === 'true';

        const games = await Schedule.findAll({
            where: {
                week: week,
                season: season,
            },
            attributes: ['id', 'home_team_char_id', 'away_team_char_id', 'spread', 'over_under', 'date', 'home_moneyline', 'away_moneyline', 'home_score', 'away_score', 'espn_id'],
            include: [
                {
                    model: nflDb.teams,
                    as: 'home_team',
                    attributes: ['short_display_name', 'team_logo_wikipedia'],
                },
                {
                    model: nflDb.teams,
                    as: 'away_team',
                    attributes: ['short_display_name', 'team_logo_wikipedia'],
                },
            ],
        });

        // build name and short name
        games.forEach(game => {
            game.short_name = `${game.away_team_char_id} @ ${game.home_team_char_id}`;
            game.name = `${game.away_team.short_display_name} @ ${game.home_team.short_display_name}`;
        });

        res.status(200).send({
            games: games,
        });
    } catch (err) {
        console.log(err);
        res.status(500).send({
            message: 'Error retrieving games',
        });
    }
}

/**
 * Get stats overview for game
 * 
 * @api {get} /api/game/overview/:id Get stats overview for game
 * @apiName GetGameOverviewById
 * @apiGroup Game
 * @apiPermission none
 * 
 * @apiParam {number} id - The game id.
 * 
 * @apiSuccess {object} data - The data object.
 * 
 * @returns {object}
 */
exports.getGameOverviewById = async (req, res) => {
    try {
        const { id } = req.params;

        const boxScoreAttributes = [
            'total_offensive_yards', 'total_drives', 'total_offensive_plays', 'yards_per_play', 'first_downs',
            'passing_yards', 'rushing_yards', 'passing_first_downs', 'rushing_first_downs', 'third_down_conversions',
            'fourth_down_conversions', 'red_zone_attempts', 'turnovers', 'field_goals_made', 'field_goals_attempted',
            'punts_inside_20', 'time_of_possession'
        ]

        var game = await Schedule.findByPk(id, {
            include: [
                {
                    model: nflDb.teams,
                    as: 'home_team',
                    attributes: ['short_display_name', 'team_logo_wikipedia', 'char_id'],
                },
                {
                    model: nflDb.teams,
                    as: 'away_team',
                    attributes: ['short_display_name', 'team_logo_wikipedia', 'char_id'],
                },
                {
                    model: nflDb.playerGameStats,
                    as: 'playerGameStats',
                    include: [
                        {
                            model: nflDb.players,
                            as: 'player',
                            attributes: ['full_name', 'position'],
                        },
                        {
                            model: nflDb.teams,
                            as: 'team',
                            attributes: ['short_display_name'],
                        }
                    ]
                },
                {
                    model: nflDb.boxscores,
                    as: 'home_boxscore',
                    attributes: boxScoreAttributes
                },
                {
                    model: nflDb.boxscores,
                    as: 'away_boxscore',
                    attributes: boxScoreAttributes
                }
            ],
            logging: false,
        });

        if (!game) {
            return res.status(404).send({ message: 'Game not found.' });
        }

        game = game.toJSON();

        // build name and short name
        game.short_name = `${game.away_team_char_id} @ ${game.home_team_char_id}`;
        game.name = `${game.away_team.team_name} @ ${game.home_team.team_name}`;

        // convert game object to game overview object with stats
        const gameOverview = convertGameToGameOverview(game);

        // drop playerGameStats from gameOverview to reduce size
        delete gameOverview.playerGameStats;

        // flatten home and away boxscores
        gameOverview.home_boxscore = gameOverview.home_boxscore[0];
        gameOverview.away_boxscore = gameOverview.away_boxscore[0];

        res.status(200).send({
            game: gameOverview,
        });
    } catch (err) {
        console.log(err);
        res.status(500).send({
            message: 'Error retrieving game',
        });
    }
}

/**
 * Convert game object to game overview object with stats
 * 
 * @param {Schedule} game - The game object.
 * 
 * @returns {object}
 */
const convertGameToGameOverview = (game) => {
    // define player stat categories
    const playerStatCategories = {
        'passing': PlayerGameStat.getPassingStatColumns(),
        'rushing': PlayerGameStat.getRushingStatColumns(),
        'receiving': PlayerGameStat.getReceivingStatColumns(),
        'fumbles': PlayerGameStat.getFumblesStatColumns(),
        'defensive': PlayerGameStat.getDefensiveStatColumns(),
        'kick_returns': PlayerGameStat.getKickReturnStatColumns(),
        'punt_returns': PlayerGameStat.getPuntReturnStatColumns(),
        'kicking': PlayerGameStat.getFieldGoalStatColumns(),
        'punting': PlayerGameStat.getPuntStatColumns(),
    }

    // initialize player stats on game object with the stat categories
    game.player_stats = {};
    Object.keys(playerStatCategories).forEach(category => {
        game.player_stats[category] = [];
    });

    // append additional attributes to player stats such as full_name, team_name, and team_id
    const appendAdditionalAttributes = (statObj, stat) => {
        statObj.full_name = stat.player.full_name;
        statObj.team_name = stat.team.short_display_name;
        statObj.team_id = stat.team_id;
        return statObj;
    }

    // add player stats to game object
    game.playerGameStats.forEach(stat => {
        // if passing_attempts, append to passing stats
        if (stat.passing_attempts) {
            var passing = {}
            playerStatCategories.passing.forEach(category => {
                passing[category] = parseFloat(stat[category]);
            });
            passing = appendAdditionalAttributes(passing, stat);
            game.player_stats.passing.push(passing);
        }

        // if rushing_attempts, append to rushing stats
        if (stat.rushing_attempts) {
            var rushing = {}
            playerStatCategories.rushing.forEach(category => {
                rushing[category] = parseFloat(stat[category]);
            });
            rushing = appendAdditionalAttributes(rushing, stat);
            game.player_stats.rushing.push(rushing);
        }

        // if targets, append to receiving stats
        if (stat.targets) {
            var receiving = {}
            playerStatCategories.receiving.forEach(category => {
                receiving[category] = parseFloat(stat[category]);
            });
            receiving = appendAdditionalAttributes(receiving, stat);
            game.player_stats.receiving.push(receiving);
        }

        // if fumbles, append to fumbles stats
        if (stat.fumbles) {
            var fumbles = {}
            playerStatCategories.fumbles.forEach(category => {
                fumbles[category] = parseFloat(stat[category]);
            });
            fumbles = appendAdditionalAttributes(fumbles, stat);
            game.player_stats.fumbles.push(fumbles);
        }

        // if tackles, interceptions, pass_defended, or defensive_touchdowns append to defensive stats
        if (stat.tackles || stat.interceptions || stat.passes_defended || stat.defensive_touchdowns) {
            var defensive = {}
            playerStatCategories.defensive.forEach(category => {
                defensive[category] = parseFloat(stat[category]);
            });
            defensive = appendAdditionalAttributes(defensive, stat);
            game.player_stats.defensive.push(defensive);
        }

        // if kick_returns, append to kick_returns stats
        if (stat.kick_returns) {
            var kick_returns = {}
            playerStatCategories.kick_returns.forEach(category => {
                kick_returns[category] = parseFloat(stat[category]);
            });
            kick_returns = appendAdditionalAttributes(kick_returns, stat);
            game.player_stats.kick_returns.push(kick_returns);
        }

        // if punt_returns, append to punt_returns stats
        if (stat.punt_returns) {
            var punt_returns = {}
            playerStatCategories.punt_returns.forEach(category => {
                punt_returns[category] = parseFloat(stat[category]);
            });
            punt_returns = appendAdditionalAttributes(punt_returns, stat);
            game.player_stats.punt_returns.push(punt_returns);
        }

        // if fg_Att, append to kicking stats
        if (stat.fg_att) {
            var kicking = {}
            playerStatCategories.kicking.forEach(category => {
                kicking[category] = parseFloat(stat[category]);
            });
            kicking = appendAdditionalAttributes(kicking, stat);
            game.player_stats.kicking.push(kicking);
        }

        // if punts, append to punting stats
        if (stat.punts) {
            var punting = {}
            playerStatCategories.punting.forEach(category => {
                punting[category] = parseFloat(stat[category]);
            });
            punting = appendAdditionalAttributes(punting, stat);
            game.player_stats.punting.push(punting);
        }
    });

    return game;
}