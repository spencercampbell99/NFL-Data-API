const sdv = require('sportsdataverse');
const axios = require('../axiosConfig').default;

const loadTeams = async () => {
    var teams = await sdv.nfl.getTeamList();

    // get teams from structure
    teams = teams.sports[0].leagues[0].teams;

    // build a dict to pass to api for team name to char id
    const teamDict = [];

    teams.forEach((team) => {
        team = team.team;
        teamDict.push({
            'id': team.id,
            'char_id': team.abbreviation,
            'name': team.name,
            'location': team.location,
            'nickname': team.nickname,
            'short_display_name': team.shortDisplayName,
            'slug': team.slug,
            'color': team.color,
            'uid': team.uid,
        })
    });

    // post to api
    await axios.post('/loaders/teams', teamDict).then(
        (response) => {
            console.log(response.data);
        },
        (error) => {
            console.log(error);
        }
    );
}

export default loadTeams;