'use client'

import axios from '@/axiosConfig';
import React from 'react'
import moment from 'moment'
import RoundedButton from '@/components/roundedButton.component';
import { useRouter } from 'next/navigation';
import { SeasonWeekSelector } from '@/components/commonComponents';
// import Table from '@/components/table/table.component';

/**
 * Game Interface for Week Overview Return from API
 */
interface Game {
    id: number
    name: string
    short_name: string
    home_team_char_id: string
    away_team_char_id: string
    home_score: number
    away_score: number
    over_under: number
    spread: number
    date: string
    home_moneyline: number
    away_moneyline: number
    homeFavorite: boolean
    homeWin: boolean
    underdogWin: boolean
    overUnder: boolean
}

/**
 * Flattened Game Interface for Table View
 */
interface GameTable {
    [key: string]: any
}

/**
 * Renders a game card component.
 * @param {Object} props - The component props.
 * @param {Game} props.game - The game object.
 * @returns {JSX.Element} The rendered game card component.
 */
const GameCard: React.FunctionComponent<{ game: Game }> = ({ game }) => {
    return (
        <>
            <div className={`flex flex-col justify-center items-center${game.underdogWin ? ' bg-red-100' : ' bg-green-200'}`}>
                <h1 className="w-full text-center text-xl font-medium">{game.name}</h1>
                <div className="flex flex-col justify-center items-left w-full">
                    <div className="grid grid-cols-5 border-black border-b-[2px]">
                        <p>Team</p>
                        <p>Score</p>
                        <p>ML</p>
                        <p>Spread</p>
                        <p>OU</p>
                    </div>
                    <div className={`grid grid-cols-5${!game.homeWin ? ' font-bold' : ''}`}>
                        <p>{game.away_team_char_id}</p>
                        <p>{game.away_score}</p>
                        <p>{game.away_moneyline}</p>
                        <p>{game.spread}</p>
                        <p className="!font-light">{game.over_under}</p>
                    </div>
                    <div className={`grid grid-cols-5${game.homeWin ? ' font-bold' : ''}`}>
                        <p>{game.home_team_char_id}</p>
                        <p>{game.home_score}</p>
                        <p>{game.home_moneyline}</p>
                        <p>{game.spread * -1}</p>
                        <p className="!font-light">{game.overUnder ? 'Over' : 'Under'}</p>
                    </div>
                </div>
            </div>
        </>
    )
}

/**
 * Renders a grid of game cards.
 * @param {Object} props - The component props.
 * @param {Game[]} props.weekOverview - The week overview object.
 * @returns {JSX.Element} The rendered game card grid component.
 */
const CardGrid: React.FunctionComponent<{ weekOverview: Game[] }> = ({ weekOverview }) => {
    return (
        <>
            <div className="w-full grid grid-cols-4 gap-2 p-2">
                {weekOverview.map((game: Game, index: number) => (
                    <GameCard key={index} game={game} />
                ))}
            </div>
        </>
    )
}

const OverviewTable: React.FunctionComponent<{ data: GameTable[] }> = ({ data }) => {
    return (
        <>
            <table className="w-full table-auto">
                <thead>
                    <tr>
                        <th className="border-[2px] px-4 py-2 font-extrabold">Date</th>
                        <th className="border-[2px] px-4 py-2 font-extrabold">Home Team</th>
                        <th className="border-[2px] px-4 py-2 font-extrabold">Away Team</th>
                        <th className="border-[2px] px-4 py-2 font-extrabold">Result</th>
                        <th className="border-[2px] px-4 py-2 font-extrabold">OU</th>
                        <th className="border-[2px] px-4 py-2 font-extrabold">Home ML</th>
                        <th className="border-[2px] px-4 py-2 font-extrabold">Away ML</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, index) => (
                        <tr key={index} className={``}>
                            <td className={`border px-4 py-2`}>{row['date']}</td>
                            <td className={`border px-4 py-2${row['homeWinner'] ? ` font-bold${row['underdogWin'] ? ' bg-red-200' : ''}` : ''}`}>{row['home_team']}</td>
                            <td className={`border px-4 py-2${!row['homeWinner'] ? ` font-bold${row['underdogWin'] ? ' bg-red-200' : ''}` : ''}`}>{row['away_team']}</td>
                            <td className={`border px-4 py-2`}>{row['result']}</td>
                            <td className={`border px-4 py-2`}>{row['over_under']} ({row['ouResult']})</td>
                            <td className={`border px-4 py-2`}>{row['home_moneyline']}</td>
                            <td className={`border px-4 py-2`}>{row['away_moneyline']}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    )
}

export default function WeekOverview({ params: { season: urlSeason, week: urlWeek }  }: { params: { season: number, week: number } }) {
    const [weekOverview, setWeekOverview] = React.useState<Game[]>([])
    const [tableData, setTableData] = React.useState<GameTable[]>([])
    const [tableView, setTableView] = React.useState<boolean>(false)
    const router = useRouter()

    const [season, setSeason] = React.useState<number>(urlSeason)
    const [week, setWeek] = React.useState<number>(urlWeek)

    const getWeekOverview = async () => {
        const response = await axios.get(`/games/overview/${urlSeason}/${urlWeek}`)

        var games = response.data.games

        // sort by date desc
        games.sort((a: Game, b: Game) => {
            return moment(a.date).diff(moment(b.date))
        })

        var tableData: GameTable[] = []
        for (let i = 0; i < games.length; i++) {
            games[i].date = moment(games[i].date).format('dddd');

            games[i].homeFavorite = games[i].spread > 0 ? true : false
            games[i].homeWin = games[i].home_score > games[i].away_score
            games[i].underdogWin = (games[i].homeFavorite && !games[i].homeWin) || (!games[i].homeFavorite && games[i].homeWin)
            games[i].overUnder = games[i].home_score + games[i].away_score > games[i].over_under

            // flatten data structure and get it table ready
            tableData.push({
                date: games[i].date,
                home_team: games[i].home_team_char_id + ` (${games[i].spread})`,
                away_team: games[i].away_team_char_id + ` (${games[i].spread * -1})`,
                result: `${games[i].home_score}-${games[i].away_score}`,
                over_under: games[i].over_under,
                spread: games[i].spread,
                home_moneyline: games[i].home_moneyline,
                away_moneyline: games[i].away_moneyline,
                ouResult: games[i].overUnder ? 'Over' : 'Under',
                homeWinner: games[i].homeWin,
                homeFavorite: games[i].homeFavorite,
                underdogWin: games[i].underdogWin,
            });
        }

        setWeekOverview(games)
        setTableData(tableData)
    }

    // load overview for week on page load (only once)
    React.useEffect(() => {
        getWeekOverview()
    }, [])

    return (
        <main className="text-black">
            <div className="flex flex-row items-center justify-center gap-2 mt-2 text-black">
                <SeasonWeekSelector season={season} week={week} setSeason={setSeason} setWeek={setWeek} buttonText="Go" onClick={() => router.push(`/nfl/games/${season}/${week}/sportsbook-performance`)} />
            </div>
            <div className="h-[45px] mb-1">
                <RoundedButton text="Change View" onClick={() => setTableView(!tableView)} className="float-left absolute mt-1 left-1" />
                <h1 className="text-2xl font-bold text-center leading-[45px]">{`Week ${urlWeek} Overview`}</h1>
            </div>
            {weekOverview ? 
                tableView ? (<OverviewTable data={tableData} />)
                : (<CardGrid weekOverview={weekOverview} />) 
            : null}
        </main>
    )
}
