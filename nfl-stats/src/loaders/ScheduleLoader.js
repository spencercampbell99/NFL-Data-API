const sdv = require('sportsdataverse');
const axios = require('../axiosConfig').default;
const moment = require('moment');

const loadSchedules = async (year) => {
    // post data for week
    const postForWeek = (data) => {
        var schedules = [];

        // flatten
        for (const [key, value] of Object.entries(data)) {
            for (const game of value.games) {
                schedules.push(game);
            }
        }

        // build a dict to pass to api for team name to char id
        const scheduleDict = [];

        schedules.forEach((schedule) => {
            // get home and away team ids and char ids
            var competitors = schedule.competitions[0].competitors;
    
            var homeTeam;
            var awayTeam;
            if (competitors[0].homeAway === 'home') {
                homeTeam = competitors[0];
                awayTeam = competitors[1];
            } else {
                homeTeam = competitors[1];
                awayTeam = competitors[0];
            }
    
            var momentDate = moment(schedule.date.replace('Z', ''));
            var date = momentDate.format('YYYY-MM-DD').toString();
            var time = momentDate.format('HH:mm:ss').toString();
    
            scheduleDict.push({
                id: schedule.id,
                uid: schedule.uid,
                home_team_id: homeTeam.id,
                away_team_id: awayTeam.id,
                home_team_char_id: homeTeam.team.abbreviation,
                away_team_char_id: awayTeam.team.abbreviation,
                conference_game: schedule.competitions[0].conferenceCompetition,
                short_name: schedule.short_name ? schedule.short_name : awayTeam.team.abbreviation + ' @ ' + homeTeam.team.abbreviation,
                name: schedule.name,
                location: schedule.competitions[0].venue.address.city, // TODO: Replace this with venue id once I have that table
                neutral_site: schedule.competitions[0].neutralSite,
                week: schedule.week.number,
                season: schedule.season.year,
                season_type: schedule.season.slug,
                date: date,
                time: time,
                espn_link: schedule.links[0].href,
                play_by_play_available: schedule.playByPlayAvailable,
            });
        });

        // post to api
        axios.post('/loaders/schedules', scheduleDict).then(
            (response) => {
                console.log(response.data);
            },
            (error) => {
                console.log(error);
            }
        );
    }

    /**
     * getWeeklySchedule(week (1-17), year, seasonType (1=pre, 2=reg, 3=post))
     * 
     * https://js.sportsdataverse.org/docs/nfl#nflgetweeklyscheduleweek-year-seasontype-⇒
     */

    // load regular season games
    for (var week = 1; week < 18; week++) {
        try {
            var schedules = await sdv.nfl.getWeeklySchedule({ week: week, year: year, seasonType: 2 });
            postForWeek(schedules);
        } catch (error) {
            console.log(error);
        }
    }

    // load postseason games
    for (var week = 1; week < 5; week++) {
        try {
            var schedules = await sdv.nfl.getWeeklySchedule({ week: week, year: year, seasonType: 3 });
            postForWeek(schedules);
        } catch (error) {
            console.log(error);
        }
    }

    // load preseason games
    // for (var week = 1; week < 5; week++) {
    //     try {
    //         var schedules = await sdv.nfl.getWeeklySchedule({ week: week, year: year, seasonType: 1 });
    //         spostForWeek(schedules);
    //     } catch (error) {
    //         console.log(error);
    //     }
    // }
}

export default loadSchedules;