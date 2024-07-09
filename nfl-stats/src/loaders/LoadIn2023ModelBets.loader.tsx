import BetService from '@/services/Bet.service';
import ScoreModelService from '@/services/ScoreModel.service';
// import Bet from '@/interfaces/Bet.interface';
// import BetLeg from '@/interfaces/BetLeg.interface';

async function loadIn2023ModelBets() {
    // load all moneyline model predictions for 2023 season
    let modelPredictions = await ScoreModelService.listModelPredictionsBySeason({ season: 2023 })

    // clear user's bets
    await BetService.removeAllBetsForAuthUser();

    // for each model prediction, create a bet
    // for (const modelPrediction of modelPredictions) {
    //     // set up bet
    //     let bet: Bet = {
    //         amount: 10,
    //         betLegs: []
    //     }

    //     // create bet
    //     await BetService.createBet(bet);
    // }
}

export default loadIn2023ModelBets;