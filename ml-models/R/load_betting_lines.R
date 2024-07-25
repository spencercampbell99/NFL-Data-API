library(DBI)

# Define the connection details
db_host <- "localhost"
db_port <- 3306
db_user <- "root"
db_password <- "password"
db_name <- "nfldb"

# get the data from nflreadr
library(nflreadr)
games <- load_schedules(seq(2023, 2024))

# take espn, total_line, spread_line, home_money_line, away_money_line from games
games <- games[, c("espn", "total_line", "spread_line", "home_moneyline", "away_moneyline")]

# Create the connection
con <- dbConnect(RMySQL::MySQL(),
                 host = db_host,
                 port = db_port,
                 user = db_user,
                 password = db_password,
                 dbname = db_name)

# update the over_under, spread, home_money_line, away_money_line columns on schedules table on sdv_game_id with the data from games
for (i in 1:nrow(games)) {
  # if any values are na, skip
    if (is.na(games$total_line[i]) | is.na(games$spread_line[i]) | is.na(games$home_moneyline[i]) | is.na(games$away_moneyline[i])) {
        next
    }
  
  dbSendQuery(con, paste0("UPDATE schedules SET over_under = ", games$total_line[i], ", spread = ", games$spread_line[i], ", home_team_money_line = ", games$home_moneyline[i], ", away_team_money_line = ", games$away_moneyline[i], " WHERE sdv_game_id = ", games$espn[i], ";"))
}

# Close the connection when done
dbDisconnect(con)
