import * as Chess from 'chess.js'
import { BehaviorSubject} from 'rxjs'
import PubNub from 'pubnub';


const chess = new Chess()
const userinfo = JSON.parse(localStorage.getItem('userinfo'));
const pubnub = new PubNub({
    publishKey: "pub-c-e0419b3b-6aa9-4e4f-af8a-8dc193d1805a",
    subscribeKey: "sub-c-ee3e0f22-18b4-11ec-901d-e20c06117408",
    uuid: userinfo.username
});
pubnub.addListener({
    status: function (statusEvent) {
        if (statusEvent.category === "PNConnectedCategory") {
            console.log("Connected to PubNub!")
        }
    },
    message: function (msg) {
        if (msg.message.text) {
            const mes = JSON.parse(msg.message.text)
            handleMove(mes.from, mes.to);
        }
    }
});

//Subscribes to the channel in our state
pubnub.subscribe({
    channels: userinfo.channel
});

export const gameSubject = new BehaviorSubject()

export function initGame() {
    const savedGame = localStorage.getItem('savedGame')
    if (savedGame) {
        chess.load(savedGame)
    }
    updateGame();
}

export function resetGame() {
    chess.reset();
    updateGame();
}
export function unduLastMove() {
    chess.undo();
    updateGame();
}

export function handleMove(from, to) {
    const promotions = chess.moves({ verbose: true }).filter(m => m.promotion)
    if (promotions.some(p => `${p.from}:${p.to}` === `${from}:${to}`)) {
        const pendingPromotion = { from, to, color: promotions[0].color }
        updateGame(pendingPromotion)
    }
    const { pendingPromotion } = gameSubject.getValue()

    if (!pendingPromotion) {
        move(from, to)
        publishMessage(from, to);
    }
}
//Publishing messages via PubNub
function publishMessage(from,to) {
    const info = JSON.parse(localStorage.getItem('userinfo'));
    if (info) {
        let messageObject = {
            text: JSON.stringify({ from:from,to:to}),
            uuid: info.username
        };

        pubnub.publish({
            message: messageObject,
            channel: info.chanell
        });
    }
}

export function move(from, to, promotion) {
    let tempMove = { from, to }
    if (promotion) {
        tempMove.promotion = promotion
    }
    const legalMove = chess.move(tempMove)

    if (legalMove) {
        updateGame();
    }
}

export function updateGame(pendingPromotion) {
    const isGameOver = chess.game_over()
    const newGame = {
        board: chess.board(),
        pendingPromotion,
        isGameOver,
        turn: chess.turn() === "w" ? 'TURN WHITE':'TURN BLACK'  ,
        result: isGameOver ? getGameResult() : null,
        history: chess.history({ verbose: true }),
        incheck: getin_check(),
    }
    localStorage.setItem('savedGame', chess.fen())
    gameSubject.next(newGame)
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
