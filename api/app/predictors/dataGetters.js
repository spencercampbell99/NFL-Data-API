const sequelize = require('../sequelize').sequelize
const fs = require('fs')

function getRollingOffensivePerformanceForTeamOnWeek(team, week, season = 2023, weeksBack = 5) {
    const query = fs.readFileSync('./api/app/predictors/sql/rolling_offensive_performance_for_team_on_week.sql').toString()

    // get the averaged offensive performance for the team on the week (passing in the season, week, team_id and weeksBack)
    return sequelize.query(query, {
        replacements: {
            season: season,
            week: week,
            team_id: team,
            weeks_back: weeksBack
        }
    })
}

module.exports = {
    getRollingOffensivePerformanceForTeamOnWeek
}