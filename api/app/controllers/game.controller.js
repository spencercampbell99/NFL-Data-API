const db = require('../models');
const Schedule = db.schedules;
const PlayerGameStat = db.playerGameStats;

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
 * @returns {[Schedule]}
 */
exports.getGamesBySeasonAndWeek = async ({ week, season, idsOnly = true }) => {
    try {
        const games = await Schedule.findAll({
            where: {
                week: week,
                season: season,
            },
            attributes: idsOnly ? ['id', 'espn_id'] : undefined
        });
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
        const { season, week } = req.params;
        const games = await Schedule.findAll({
            where: {
                week: week,
                season: season,
            },
            attributes: ['id', 'home_team_char_id', 'away_team_char_id', 'spread', 'over_under', 'date', 'home_moneyline', 'away_moneyline', 'home_score', 'away_score'],
            include: [
                {
                    model: db.teams,
                    as: 'home_team',
                    attributes: [['short_display_name', 'team_name'], ['team_logo_wikipedia', 'wiki_logo_url']],
                },
                {
                    model: db.teams,
                    as: 'away_team',
                    attributes: [['short_display_name', 'team_name'], ['team_logo_wikipedia', 'wiki_logo_url']],
                },
            ],
        });

        // build name and short name
        games.forEach(game => {
            game.short_name = `${game.away_team_char_id} @ ${game.home_team_char_id}`;
            game.name = `${game.away_team.team_name} @ ${game.home_team.team_name}`;
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
        var game = await Schedule.findByPk(id, {
            include: [
                {
                    model: db.teams,
                    as: 'home_team',
                    attributes: [['short_display_name', 'team_name'], ['team_logo_wikipedia', 'wiki_logo_url']],
                },
                {
                    model: db.teams,
                    as: 'away_team',
                    attributes: [['short_display_name', 'team_name'], ['team_logo_wikipedia', 'wiki_logo_url']],
                },
                {
                    model: db.boxscores,
                    as: 'home_boxscore',
                },
                {
                    model: db.boxscores,
                    as: 'away_boxscore',
                },
                {
                    model: db.playerGameStats,
                    as: 'playerGameStats',
                    include: [
                        {
                            model: db.players,
                            as: 'player',
                            attributes: ['full_name', 'position'],
                        },
                        {
                            model: db.teams,
                            as: 'team',
                            attributes: ['short_display_name'],
                        }
                    ]
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

        console.log(gameOverview.player_stats)

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

    // add player stats to game object
    game.playerGameStats.forEach(stat => {
        // if passing_attempts, append to passing stats
        if (stat.passing_attempts) {
            var passing = {}
            playerStatCategories.passing.forEach(category => {
                passing[category] = stat[category];
            });
            passing.full_name = stat.player.full_name;
            passing.team_name = stat.team.short_display_name;
            game.player_stats.passing.push(passing);
        }

        // if rushing_attempts, append to rushing stats
        if (stat.rushing_attempts) {
            var rushing = {}
            playerStatCategories.rushing.forEach(category => {
                rushing[category] = stat[category];
            });
            rushing.full_name = stat.player.full_name;
            rushing.team_name = stat.team.short_display_name;
            game.player_stats.rushing.push(rushing);
        }

        // if targets, append to receiving stats
        if (stat.targets) {
            var receiving = {}
            playerStatCategories.receiving.forEach(category => {
                receiving[category] = stat[category];
            });
            receiving.full_name = stat.player.full_name;
            receiving.team_name = stat.team.short_display_name;
            game.player_stats.receiving.push(receiving);
        }

        // if fumbles, append to fumbles stats
        if (stat.fumbles) {
            var fumbles = {}
            playerStatCategories.fumbles.forEach(category => {
                fumbles[category] = stat[category];
            });
            fumbles.full_name = stat.player.full_name;
            fumbles.team_name = stat.team.short_display_name;
            game.player_stats.fumbles.push(fumbles);
        }

        // if tackles, interceptions, pass_defended, or defensive_touchdowns append to defensive stats
        if (stat.tackles || stat.interceptions || stat.passes_defended || stat.defensive_touchdowns) {
            var defensive = {}
            playerStatCategories.defensive.forEach(category => {
                defensive[category] = stat[category];
            });
            defensive.full_name = stat.player.full_name;
            defensive.team_name = stat.team.short_display_name;
            game.player_stats.defensive.push(defensive);
        }

        // if kick_returns, append to kick_returns stats
        if (stat.kick_returns) {
            var kick_returns = {}
            playerStatCategories.kick_returns.forEach(category => {
                kick_returns[category] = stat[category];
            });
            kick_returns.full_name = stat.player.full_name;
            kick_returns.team_name = stat.team.short_display_name;
            game.player_stats.kick_returns.push(kick_returns);
        }

        // if punt_returns, append to punt_returns stats
        if (stat.punt_returns) {
            var punt_returns = {}
            playerStatCategories.punt_returns.forEach(category => {
                punt_returns[category] = stat[category];
            });
            punt_returns.full_name = stat.player.full_name;
            punt_returns.team_name = stat.team.short_display_name;
            game.player_stats.punt_returns.push(punt_returns);
        }

        // if fg_Att, append to kicking stats
        if (stat.fg_att) {
            var kicking = {}
            playerStatCategories.kicking.forEach(category => {
                kicking[category] = stat[category];
            });
            kicking.full_name = stat.player.full_name;
            kicking.team_name = stat.team.short_display_name;
            game.player_stats.kicking.push(kicking);
        }

        // if punts, append to punting stats
        if (stat.punts) {
            var punting = {}
            playerStatCategories.punting.forEach(category => {
                punting[category] = stat[category];
            });
            punting.full_name = stat.player.full_name;
            punting.team_name = stat.team.short_display_name;
            game.player_stats.punting.push(punting);
        }
    });

    return game;
}