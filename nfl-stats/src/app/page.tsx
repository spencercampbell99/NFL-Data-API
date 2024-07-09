'use client'

import Image from 'next/image'
import loadTeams from '../loaders/TeamLoader'
import loadSchedules from '../loaders/ScheduleLoader'
import loadBoxScores from '../loaders/BoxscoreLoader'
import loadPlayerStats from '../loaders/PlayerStatLoader'

export default function Home() {
  // const loadScheduleForYears = (startYear: number, endYear: number) => {
  //   for (let year = startYear; year <= endYear; year++) {
  //     loadSchedules(year)
  //   }
  // }
  // const loadBoxScoresForYears = async (startYear: number, endYear: number) => {
  //   for (let year = startYear; year <= endYear; year++) {
  //     for (let week = 1; week <= 18; week++) {
  //       await loadBoxScores({ season: year, week: week })
  //     }
  //   }
  // }
  // const loadPlayerStatsForYears = async (startYear: number, endYear: number) => {
  //   for (let year = startYear; year <= endYear; year++) {
  //     for (let week = 1; week <= 18; week++) {
  //       await loadPlayerStats({ season: year, week: week })
  //       await new Promise((resolve) => setTimeout(resolve, 2000));
  //     }
  //   }
  // }

  return (
    <main>
      {/* <button onClick={() => getTeams()}>Load teams</button> */}
      {/* <button onClick={() => loadScheduleForYears(2023, 2023)}>Load schedules</button> */}
      {/* <button onClick={() => loadBoxScoresForYears(2010, 2023)}>Load boxscores</button> */}
      {/* <button onClick={() => loadPlayerStatsForYears(2010, 2023)}>Load player stats</button> */}
    </main>
  )
}
