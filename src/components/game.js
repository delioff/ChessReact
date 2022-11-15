import * as Chess from 'chess.js'
import { BehaviorSubject} from 'rxjs'
import PubNub from 'pubnub';


const chess = new Chess()


export const gameSubject = new BehaviorSubject()

export function initGame() {
    //const savedGame = localStorage.getItem('savedGame')
    //if (savedGame) {
    //    chess.load(savedGame)
    //}
    updateGame();
}

export function resetGame(iswhite,resign) {

    chess.reset();
    updateGame(null,true,iswhite,resign);
}
export function unduLastMove() {
    chess.undo();
    updateGame();
}

export function handleMove(from, to, frompush, channel, user, promotion,color) {
    if (promotion) {
        move(from, to, promotion)
        if (frompush) publishMessage(from, to, channel, user, promotion);
        return;
    }
    const promotions = chess.moves({ verbose: true }).filter(m => m.promotion)
    if (promotions.some(p => `${p.from}:${p.to}` === `${from}:${to}`)) {
        const pendingPromotion = { from, to, color: promotions[0].color }
        updateGame(pendingPromotion,null,color)
    }
    const { pendingPromotion } = gameSubject.getValue()

    if (!pendingPromotion) {
        move(from, to,null,color)
        if (frompush) publishMessage(from, to, channel, user);
    }
}
//Publishing messages via PubNub
function publishMessage(from, to, channel, user,promotion) {
    const pubnub = new PubNub({
        publishKey: "pub-c-e0419b3b-6aa9-4e4f-af8a-8dc193d1805a",
        subscribeKey: "sub-c-ee3e0f22-18b4-11ec-901d-e20c06117408",
        uuid: user
    });
    let messageObject = {
        text: JSON.stringify({ from: from, to: to, user: user, promotion: promotion }),
        user: user
    };

    pubnub.publish({
        message: messageObject,
        channel: channel
    });
}
export function loadGame(gamename) {
    const savedGame = localStorage.getItem(gamename)
    if (savedGame) {
        chess.load_pgn(savedGame)
        updateGame()
        return true
    }
    else return false
}
export function canMovePiece(from, to) {
    const moves = chess.moves({ verbose: true }).filter(m => m.from === from);
    return moves.some(p => p.to === to);
}
export function loadFen(gamename) {
    try {
        chess.load(gamename)
        updateGame()
    }
    catch (e) {
        return false
    }
    return true
}
export function showFen(gamename) {
    return chess.fen();
}
export function saveGame(gamename) {
    localStorage.setItem(gamename,chess.pgn())
}
export function move(from, to, promotion,color) {
    let tempMove = { from, to }
    if (promotion) {
        tempMove.promotion = promotion
    }
    const legalMove = chess.move(tempMove, { sloppy: true })

    if (legalMove) {
        updateGame(null,null,color);
    }
}

export function updateGame(pendingPromotion,isnew,color,resign) {
    const isGameOver = chess.game_over()
    const currgame = gameSubject.getValue()
    
    var curruserscore1 = currgame && currgame.user1score ? currgame.user1score : 0
    var curruserscore2 = currgame && currgame.user2score ? currgame.user2score : 0
    if (isGameOver) {
        if (color == "White") {
            curruserscore1 += getPointResult("w");
            curruserscore2 += getPointResult("b");
        }
        else {
            curruserscore1 += getPointResult("b");
            curruserscore2 += getPointResult("w");
        }
    }
    if (resign) { 
        if (resign == 'White') {
            if (color == "White") {
                curruserscore1++
            }
            else {
                curruserscore2++
            }
        }
        else {
            if (color == "White") {
                curruserscore2++
            }
            else {
                curruserscore1++
            }
        }
  
    }
    if (isnew) {
        let temp = curruserscore2;
        curruserscore2 = curruserscore1
        curruserscore1 = temp;
    }
  
    const newGame = {
        board: chess.board(),
        pendingPromotion,
        isGameOver,
        turn: chess.turn() === "w" ? 'TURN WHITE':'TURN BLACK'  ,
        result: isGameOver ? getGameResult() : null,
        history: chess.history({ verbose: true }),
        incheck: getin_check(),
        user1score: curruserscore1,
        user2score: curruserscore2,
        isNew:isnew
    }
    //localStorage.setItem('savedGame', chess.fen())
    gameSubject.next(newGame)
}
function getPointResult(color) {
    if (chess.in_checkmate()) {
        const winner = chess.turn() === color ? 0 : 1
        return winner
    } else if (chess.in_draw()) {
        return 0.5
    } else {
        return 0
    }
}
function getGameResult() {
    if (chess.in_checkmate()) {
        const winner = chess.turn() === "w" ? 'BLACK' : 'WHITE'
        return `CHECKMATE - WINNER - ${winner}`
    } else if (chess.in_draw()) {
        let reason = '50 - MOVES - RULE'
        if (chess.in_stalemate()) {
            reason = 'STALEMATE'
        } else if (chess.in_threefold_repetition()) {
            reason = 'REPETITION'
        } else if (chess.insufficient_material()) {
            reason = "INSUFFICIENT MATERIAL"
        }
        return `DRAW - ${reason}`
    } else {
        return 'UNKNOWN REASON'
    }
}
function getin_check() {
    if (chess.in_check()) {
        return `IN CHECK`
    } else {
        return ''
    }
}
