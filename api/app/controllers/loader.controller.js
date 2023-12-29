const db = require('../models');
const Team = db.teams;
const Schedule = db.schedules;
const Boxscore = db.boxscores;
const Player = db.players;
const PlayerGameStat = db.playerGameStats;
const Op = db.Sequelize.Op;
const axios = require('axios');

/**
 * Loads teams into the database.
 * @param {Object} req - The request object. Body should contain an array of teams with all the fields needed to create them in the db. Fields are:
 *                     - name: String
 *                     - char_id: Number
 *                     - uid: Number
 *                     - location: String
 *                     - nickname: String
 *                     - short_display_name: String
 *                     - slug: String
 *                     - color: String
 * @param {Object} res - The response object.
 * @returns {void}
 */
exports.loadTeams = async (req, res) => {
    var teamsAdded = 0;
    var teamsAlreadyExist = 0;

    try {
        const teams = req.body;

        // loop through teams and create them
        for (const team of teams) {
            // check if team exists
            const teamExists = await Team.findOne({
                where: {
                    char_id: team.char_id,
                }
            });
            if (teamExists) {
                console.log(`Team ${team.name} already exists.`);
                teamsAlreadyExist++;
                continue;
            }

            await Team.create({
                id: team.id,
                name: team.name,
                char_id: team.char_id,
                uid: team.uid,
                location: team.location,
                nickname: team.nickname,
                short_display_name: team.short_display_name,
                slug: team.slug,
                color: team.color,
            });
            teamsAdded++;
        }

        res.status(200).send({
            message: 'Teams created successfully.',
            teamsAdded: teamsAdded,
            teamsAlreadyExist: teamsAlreadyExist,
        });
    } catch (err) {
        res.status(500).send({
            message: err.message || 'Some error occurred while creating the teams.'
        });
    }
};

/**
 * Loads schedules into the database.
 * @param {Object} req - The request object. Body should contain an array of schedules with all the fields needed to create them in the db. Fields are:
 *                     - id: Number
 *                     - sdv_game_id: Number
 *                     - sdv_game_uid: Number
 *                     - home_team_id: Number
 *                     - away_team_id: Number
 *                     - home_team_char_id: Number
 *                     - away_team_char_id: Number
 *                     - conference_game: Boolean
 *                     - short_name: String
 *                     - name: String
 *                     - location: String
 *                     - neutral_site: Boolean
 *                     - week: Number
 *                     - season: Number
 *                     - season_type: String
 *                     - date: String
 *                     - time: String
 *                     - espn_link: String
 *                     - play_by_play_available: Boolean
 * @param {Object} res - The response object.
 * @returns {void}
 */
exports.loadSchedules = async (req, res) => {
    var schedulesAdded = 0;
    var schedulesAlreadyExist = 0;

    try {
        const schedules = req.body;

        // loop through schedules and create them
        for (const schedule of schedules) {
            // check if schedule exists
            const scheduleExists = await Schedule.findOne({
                where: {
                    id: schedule.id,
                }
            });
            if (scheduleExists) {
                console.log(`Schedule ${schedule.name} already exists.`);
                schedulesAlreadyExist++;
                continue;
            }

            await Schedule.create({
                id: schedule.id,
                sdv_game_id: schedule.id,
                sdv_game_uid: schedule.uid,
                home_team_id: schedule.home_team_id,
                away_team_id: schedule.away_team_id,
                home_team_char_id: schedule.home_team_char_id,
                away_team_char_id: schedule.away_team_char_id,
                conference_game: schedule.conference_game,
                short_name: schedule.short_name,
                name: schedule.name,
                location: schedule.location,
                neutral_site: schedule.neutral_site,
                week: schedule.week,
                season: schedule.season,
                season_type: schedule.season_type,
                date: schedule.date,
                time: schedule.time,
                espn_link: schedule.espn_link,
                play_by_play_available: schedule.play_by_play_available,
            });
            schedulesAdded++;
        }

        res.status(200).send({
            message: 'Schedules created successfully.',
            schedulesAdded: schedulesAdded,
            schedulesAlreadyExist: schedulesAlreadyExist,
        });
    } catch (err) {
        res.status(500).send({
            message: err.message || 'Some error occurred while creating the schedules.'
        });
    }
};

/**
 * Gets the NFL game box score data for a specified game. (modified from sportsdataverse)
 * @memberOf nfl
 * @async
 * @function
 * @param {number} id - Game id.
 * @returns json
 */
async function getBoxScore (id) {
    const baseUrl = 'http://cdn.espn.com/core/nfl/boxscore';
    const params = {
        gameId: id,
        xhr: 1,
        render: false,
        device: 'desktop',
        userab: 18
    };
    const res = await axios.get(baseUrl, {
        params,
        headers: {
            "Accept": "application/json, text/javascript, */*; q=0.01",
            "Origin": "http://localhost",
        }
    });
    const boxscore = res.data.gamepackageJSON.boxscore;
    boxscore.id = res.data.gameId;

    // add team scores
    var competitors = res.data.gamepackageJSON.header.competitions[0].competitors;
    if (competitors[0].homeAway === 'home') {
        boxscore.home_team_score = competitors[0].score;
        boxscore.away_team_score = competitors[1].score;
    } else {
        boxscore.home_team_score = competitors[1].score;
        boxscore.away_team_score = competitors[0].score;
    }

    return boxscore;
}

/**
 * Populate Boxscores for players given full boxscore object from game
 * 
 * @param {object} playerObject 
 * @param {number} team_id
 * 
 * @returns {Player}
 */
async function findOrCreatePlayer (playerObject, team_id) {
    const [player] = await Player.findOrCreate({
        where: {
            id: playerObject.id,
        },
        defaults: {
            id: playerObject.id,
            first_name: playerObject.firstName,
            last_name: playerObject.lastName,
            full_name: playerObject.displayName,
            guid: playerObject.guid ?? 'not-provided',
            team_id: team_id,
        },
        logging: false,
    });

    return player;
}

/**
 * Populate game stats for a player
 * 
 * @param {object} playerObject
 * @param {array} statKeys
 * @param {string} statName
 * @param {number} team_id
 * @param {number} boxscore_id
 * @param {number} game_id
 * 
 * @returns {boolean}
 */
async function populateGameStatsForPlayer ({ playerObject, statKeys, statName, team_id, boxscore_id, game_id }) {
    // find or create player
    const player = await findOrCreatePlayer(playerObject.athlete, team_id);

    // find existing player game stats for player and game
    var playerGameStats = await PlayerGameStat.findOrCreate({
        where: {
            player_id: player.id,
            boxscore_id: boxscore_id,
        },
        defaults: {
            player_id: player.id,
            game_id: game_id,
            team_id: team_id,
            boxscore_id: boxscore_id,
        },
        logging: false,
    });
    playerGameStats = playerGameStats[0]; // Get the first element of the array

    // convert statistics array to object
    var stats = {};
    for (var i = 0; i < statKeys.length; i++) {
        // fix the stat keys to avoid bad characters. -- means no stat, replace with 0
        const statKey = statKeys[i].replace('/', '_').replace('-', '_');
        const statValue = playerObject.stats[i].replace('/', '_').replace('--', '0').replace(/(?<!^)-/g, '_'); // replace all - with _ unless it is the first character
        stats[statKey] = statValue;
    }

    switch (statName) {
        case 'passing':
            // get passing attempts
            var passingAttempts = 0;
            var passingCompletions = 0;
            if (stats.completions_passingAttempts.length > 0) {
                const split = stats.completions_passingAttempts.split('_');
                passingAttempts = split[1];
                passingCompletions = split[0];
            }

            var sacks = 0;
            var sackYards = 0;
            if (stats.sacks_sackYardsLost.length > 0) {
                const split = stats.sacks_sackYardsLost.split('_');
                sacks = split[0];
                sackYards = split[1];
            }


            // passing
            playerGameStats.passing_attempts = passingAttempts;
            playerGameStats.passing_completions = passingCompletions;
            playerGameStats.passing_yards = stats.passingYards;
            playerGameStats.yards_per_pass_attempt = stats.yardsPerPassAttempt;
            playerGameStats.yards_per_pass_completion = passingCompletions > 0 ? stats.passingYards / passingCompletions : 0;
            playerGameStats.passing_touchdowns = stats.passingTouchdowns;
            playerGameStats.passing_interceptions = stats.interceptions;
            playerGameStats.passing_sacks = sacks;
            playerGameStats.passing_sack_yards = sackYards;
            playerGameStats.qb_rating = stats.QBRating;
            playerGameStats.adjQBR = stats.adjQBR;
            // playerGameStats.passer_rating = stats.passerRating;
            break;
        case 'rushing':
            playerGameStats.rushing_attempts = stats.rushingAttempts;
            playerGameStats.rushing_yards = stats.rushingYards;
            playerGameStats.yards_per_rush_attempt = stats.yardsPerRushAttempt;
            playerGameStats.rushing_touchdowns = stats.rushingTouchdowns;
            playerGameStats.rushing_long = stats.longRushing;
            break;
        case 'receiving':
            playerGameStats.receptions = stats.receptions;
            playerGameStats.targets = stats.receivingTargets;
            playerGameStats.receiving_yards = stats.receivingYards;
            playerGameStats.yards_per_reception = stats.yardsPerReception;
            playerGameStats.receiving_touchdowns = stats.receivingTouchdowns;
            playerGameStats.receiving_long = stats.longReceiving;
            break;
        case 'fumbles':
            playerGameStats.fumbles = stats.fumbles;
            playerGameStats.fumbles_lost = stats.fumblesLost;
            playerGameStats.fumbles_recovered = stats.fumblesRecovered;
            break;
        case 'defensive':
            playerGameStats.tackles = stats.totalTackles;
            playerGameStats.tackles_for_loss = stats.tacklesForLoss;
            playerGameStats.solo_tackles = stats.soloTackles;
            playerGameStats.sacks = stats.sacks;
            playerGameStats.qb_hits = stats.QBHits;
            playerGameStats.defensive_touchdowns = stats.defensiveTouchdowns;
            playerGameStats.passes_defended = stats.passesDefended;
            break;
        case 'interceptions':
            playerGameStats.interceptions = stats.interceptions;
            playerGameStats.interception_yards = stats.interceptionYards;
            playerGameStats.interception_touchdowns = stats.interceptionTouchdowns;
            break;
        case 'kickReturns':
            playerGameStats.kick_returns = stats.kickReturns;
            playerGameStats.kick_return_yards = stats.kickReturnYards;
            playerGameStats.yards_per_kick_return = stats.yardsPerKickReturn;
            playerGameStats.kick_return_touchdowns = stats.kickReturnTouchdowns;
            playerGameStats.king_return_long = stats.longKickReturn;
            break;
        case 'kicking':
            var fieldGoalsMade = 0; // this is broken for some reason
            var fieldGoalsAttempted = 0;
            if (stats.fieldGoalsMade_fieldGoalAttempts.length > 0) {
                const split = stats.fieldGoalsMade_fieldGoalAttempts.split('_');
                fieldGoalsMade = split[0];
                fieldGoalsAttempted = split[1];
            }

            var extraPointsMade = 0; // this is also broken for some reason
            var extraPointsAttempted = 0;
            if (stats.extraPointsMade_extraPointAttempts.length > 0) {
                const split = stats.extraPointsMade_extraPointAttempts.split('_');
                extraPointsMade = split[0];
                extraPointsAttempted = split[1];
            }

            playerGameStats.field_goals_made = fieldGoalsMade;
            playerGameStats.field_goal_attempts = fieldGoalsAttempted;
            playerGameStats.field_goal_long = stats.longFieldGoalMade;
            playerGameStats.field_goal_percentage = stats.fieldGoalPct == 100 ? 100 : stats.fieldGoalPct;
            playerGameStats.total_kicking_points = stats.totalKickingPoints;
            playerGameStats.extra_points_made = extraPointsMade;
            playerGameStats.extra_point_attempts = extraPointsAttempted;
            playerGameStats.extra_point_percentage = extraPointsAttempted > 0 ? extraPointsMade / extraPointsAttempted : 0;
            break;
        case 'punting':
            playerGameStats.punts = stats.punts;
            playerGameStats.punt_yards = stats.puntYards;
            playerGameStats.yards_per_punt = stats.grossAvgPuntYards;
            playerGameStats.punt_long = stats.longPunt;
            playerGameStats.punts_inside_20 = stats.puntsInside20;
            playerGameStats.touchbacks = stats.touchbacks;
            break;
        case 'puntReturns':
            playerGameStats.punt_returns = stats.puntReturns;
            playerGameStats.punt_return_yards = stats.puntReturnYards;
            playerGameStats.yards_per_punt_return = stats.yardsPerPuntReturn;
            playerGameStats.punt_return_touchdowns = stats.puntReturnTouchdowns;
            playerGameStats.punt_return_long = stats.longPuntReturn;
            break;
        default:
            console.log(`Unknown player stat type: ${statName}`);
            return false;
    }
    playerGameStats.save({ logging: false })

    return playerGameStats;
}

/**
 * Populate Boxscores for teams given full boxscore object from game
 * 
 * @param {Object} boxscore - The boxscore object.
 * 
 * @returns {void}
 */
async function populateBoxscoresForTeams (boxscore) {
    // get home and away teams
    const home_team = boxscore.teams[1].team;
    const away_team = boxscore.teams[0].team;

    // check if teams exist
    const homeTeamExists = await Team.findOne({
        where: {
            id: home_team.id,
        }
    });
    if (!homeTeamExists) {
        console.log(`Team ${home_team.name} does not exist.`);
        return;
    }
    const awayTeamExists = await Team.findOne({
        where: {
            id: away_team.id,
        }
    });
    if (!awayTeamExists) {
        console.log(`Team ${away_team.name} does not exist.`);
        return;
    }

    // loop through stats and create boxscores
    for (const teamBoxscore of boxscore.teams) {
        const team = teamBoxscore.team;
        const isHomeTeam = team.id === home_team.id;

        // convert statistics array to object
        var stats = {};
        for (const stat of teamBoxscore.statistics) {
            stats[stat.name] = stat.displayValue;
        }

        // create boxscore
        await Boxscore.create({
            team_id: team.id,
            opponent_id: isHomeTeam ? away_team.id : home_team.id,
            schedule_id: boxscore.id,
            team_char_id: team.abbreviation,
            home_team: isHomeTeam,
            points_scored: isHomeTeam ? boxscore.home_team_score : boxscore.away_team_score,
            points_allowed: isHomeTeam ? boxscore.away_team_score : boxscore.home_team_score,
            first_downs: stats.firstDowns,
            passing_first_downs: stats.firstDownsPassing,
            rushing_first_downs: stats.firstDownsRushing,
            penalty_first_downs: stats.firstDownsPenalty,
            third_down_conversions: stats.thirdDownEff.length > 0 ? stats.thirdDownEff.split('-')[0] : 0,
            third_down_attempts: stats.thirdDownEff.length > 0 ? stats.thirdDownEff.split('-')[1] : 0,
            fourth_down_conversions: stats.fourthDownEff.length > 0 ? stats.fourthDownEff.split('-')[0] : 0,
            fourth_down_attempts: stats.fourthDownEff.length > 0 ? stats.fourthDownEff.split('-')[1] : 0,
            red_zone_attempts: stats.redZoneAttempts.length > 0 ? stats.redZoneAttempts.split('-')[1] : 0,
            red_zone_scores: stats.redZoneAttempts.length > 0 ? stats.redZoneAttempts.split('-')[0] : 0,
            total_drives: stats.totalDrives,
            total_offensive_plays: stats.totalOffensivePlays,
            total_offensive_yards: stats.totalYards,
            yards_per_play: stats.yardsPerPlay,
            passing_yards: stats.netPassingYards,
            passing_attempts: stats.completionAttempts.length > 1 ? stats.completionAttempts.split('-')[1] : 0,
            passing_completions: stats.completionAttempts.length > 0 ? stats.completionAttempts.split('-')[0] : 0,
            yards_per_pass_attempt: stats.yardsPerPass,
            yards_per_pass_completion: stats.completionAttempts.length > 0 ? stats.netPassingYards / stats.completionAttempts.split('-')[0] : 0,
            interceptions_thrown: stats.interceptions,
            sacks_allowed: stats.sacksYardsLost.length > 0 ? stats.sacksYardsLost.split('-')[0] : 0,
            sack_yards_lost: stats.sacksYardsLost.length > 0 ? stats.sacksYardsLost.split('-')[1] : 0,
            rushing_yards: stats.rushingYards,
            rushing_attempts: stats.rushingAttempts,
            yards_per_rush: stats.yardsPerRushAttempt,
            turnovers: stats.turnovers,
            fumbles: stats.fumblesLost, // stats.fumbles, // calulcated from player stats, for now, 0
            fumbles_lost: stats.fumblesLost,
            team_total_penalties: stats.totalPenaltiesYards.length > 0 ? stats.totalPenaltiesYards.split('-')[0] : 0,
            penalty_yards_against: stats.totalPenaltiesYards.length > 0 ? stats.totalPenaltiesYards.split('-')[1] : 0,
            time_of_possession: stats.possessionTime,

            // defense and special teams
            defense_special_teams_tds: stats.defensiveTouchdowns,
        });
    }
}

/**
 * Load player stats for Game
 * 
 * Loads player stats from espn api via sportsdataverse and saves it to the database.
 * 
 * @param {number} gameId - The game id.
 * 
 * @returns {object}
 */
exports.loadPlayerStatsForGame = async (gameId) => {
    // get player data into loopable format to call populateGameStatsForPlayer
    const boxScore = await getBoxScore(gameId);

    var boxScoreId;

    var playersAdded = 0;
    var playersFailed = 0;
    var boxScoreResults = [];

    for (const teamPlayerStats of boxScore.players) {
        const team_id = teamPlayerStats.team.id;
        const game_id = boxScore.id;

        boxScoreId = await Boxscore.findOne({
            where: {
                team_id: team_id,
                schedule_id: game_id,
            },
            attributes: ['id'],
            logging: false,
        });
        if (!boxScoreId) {
            const message = `Boxscore for game ${gameId} does not exist. Create that first. Skipping.`;
            console.log(message);
            boxScoreResults.push({
                team_id: team_id,
                message: message,
            });
            continue;
        }
        boxScoreId = boxScoreId.id;

        for (const statistic of teamPlayerStats.statistics) {
            const statKeys = statistic.keys;
            const statName = statistic.name;

            for (const athlete of statistic.athletes) {
                const result = await populateGameStatsForPlayer({
                    playerObject: athlete,
                    statKeys: statKeys,
                    statName: statName,
                    team_id: team_id,
                    boxscore_id: boxScoreId,
                    game_id: game_id
                });
                if (result) {
                    playersAdded++;
                } else {
                    playersFailed++;
                }
            }
        }

        boxScoreResults.push({
            team_id: team_id,
            message: `Populated player stats for team ${team_id} for game ${game_id}`,
        });
    }

    return {
        playersAdded: playersAdded,
        playersFailed: playersFailed,
        boxScoreResults: boxScoreResults,
    }
}

/**
 * Load Boxscore For Game
 * 
 * Loads box score from espn api via sportsdataverse and saves it to the database.
 * 
 * @param {number} gameId - The game id.
 * 
 * @returns {object}
 */
exports.loadBoxscoreForGame = async (gameId) => {
    // check if boxscore already exists
    const boxscoreExists = await Boxscore.findOne({
        where: {
            schedule_id: gameId,
        },
        attributes: ['id']
    });
    if (boxscoreExists) {
        const message = `Boxscore for game ${gameId} already exists. Call update if you wish to overwrite.`;
        console.log(message);
        return message;
    }

    // if game hasn't happened, skip
    const game = await Schedule.findOne({
        where: {
            id: gameId,
        },
        attributes: ['date']
    });
    if (game.date > Date.now()) {
        const message = `Game ${gameId} has not happened yet. Skipping.`;
        console.log(message);
        return message;
    }

    // get boxscore
    var boxScore = await getBoxScore(gameId);

    // populate boxscores for teams
    await populateBoxscoresForTeams(boxScore);

    return boxScore
}