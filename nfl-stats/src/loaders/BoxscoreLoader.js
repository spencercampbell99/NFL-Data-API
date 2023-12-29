import { exit } from 'process';
const axios = require('../axiosConfig').default;

const loadBoxScores = async ({ week, season }) => {
    if (!week || !season) {
        console.log('Week and season are required.');
        return;
    }

    /**
     * getBoxScore(id (game id))
     * 
     * https://js.sportsdataverse.org/docs/nfl#nflgetboxscoreid-⇒
     */

    // get games (schedules) for given season and week
    var games = await axios.get(`/games/week/${week}/season/${season}`, {params: {idsOnly: true}}).then(
        (response) => {
            // flatten
            var gameIds = [];
            for (const game of response.data) {
                gameIds.push(game.id);
            }
            return gameIds;
        },
        (error) => {
            console.log(error);
            exit(1);
        }
    );

    // call load endpoint for box score
    for (const gameId of games) {
        await axios.get('/loaders/boxscores/' + gameId).then(
            (response) => {
                console.log(response.data);
            },
            (error) => {
                console.log(error);
            }
        );
    }

    // // get box scores for each game
    // for (const gameId of games) {
    //     try {
    //         var boxScore = await sdv.nfl.getBoxScore({ id: 401547578 });

    //         console.log(boxScore);
    //         return
    //         // postForWeek(boxScore);
    //     } catch (error) {
    //         console.log(error);
    //     }
    // }
}

export default loadBoxScores;