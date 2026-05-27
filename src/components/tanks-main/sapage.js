import React, { useEffect, useRef,useState} from 'react'
import { BrowserView, MobileView } from 'react-device-detect';
import Swal from "sweetalert2";

function SaPage() {
    const canvasRef = useRef(null);
    const explosionImg = useRef(null);
    explosionImg.current = new Image();
    explosionImg.current.src = "bomba.png";
    const audio = new Audio("bomb.mp3");
    const gameRef = useRef(null); // <-- Add this line
   
    const [firsttime, setfirsttime] = useState(0);
    const [currentplayer, setcurrentplayer] = useState(0);
    const [sh1, setsh1] = useState({ x: 0, y: 0 });
    const [shottr, setshottr] = useState([]);
   
    const TEST_MODE = false;
    // const TEST_MODE = true;
   
    // GAME CONSTANTS
    const PLAYER_COLORS = [`#56EBC3`, `#A955EB`, `#97EB55`, `#55E2EB`, `#B8D81E`, `#EBC356`, `#1ED89B`, `#3E1ED8`, `#1DD75B`, `#1DD7D7`, `#D3E1FD`,
        '#fdf0d5', '#eb5e55', '#c6d8d3', '#4b7f52'];
    const TURRET_INCREMENT = 0.5;
    const TANK_SIZE = 25;
    const EXPLOSION_RADIUS = 50;
    const EXPLOSION_DELAY = 2500;
    const TERRAIN_BUMPS = 18 ;
    const STEEPNESS = 3;
    const HORIZON_DEPTH = 0.25; // 0-1
    let DEFAULT_NUM_HUMANS = 3;
    if (TEST_MODE) DEFAULT_NUM_HUMANS = 6;
    const DEFAULT_NUM_ROBOTS = 0;
    const GRAVITY = 0.06;
    const SHOT_DELAY = 3;
    const X_BOOSTER = 1.5;
    
    //////////////////////////////////////
    class Bullet {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }
    }
    //////////////////////////////////////
    function degreesToRadians(degrees) {
        return (Math.PI / 180) * degrees;
    }
    //////////////////////////////////////
   
    const showExplosion = function (sh, tr) {
        setshottr(tr);
        setsh1(sh);
    }
    //////////////////////////////////////
    // DESTROY GROUND
    const destroyGround = function (thisShot) {
        const crater = {
            leftEdge: { x: Math.floor(thisShot.x - EXPLOSION_RADIUS), y: 0 },
            rightEdge: { x: Math.floor(thisShot.x + EXPLOSION_RADIUS), y: 0 },
            terrainArray: [[]],
        };

        // set y values at X edges of explosion
        crater.leftEdge = dropItem(crater.leftEdge);
        crater.rightEdge = dropItem(crater.rightEdge);

        // fill first node of crater terrain array
        crater.terrainArray[0][0] = crater.leftEdge.x;
        crater.terrainArray[0][1] = crater.leftEdge.y;
        // dig deep left side
        crater.terrainArray.push([crater.leftEdge.x + 1, crater.leftEdge.y + EXPLOSION_RADIUS, 0, 0]);

        // generate crater inner shape
        // TODO: add random jagged edges
        // random center depth
        crater.terrainArray.push([thisShot.x, thisShot.y + getRandomInt(TANK_SIZE, EXPLOSION_RADIUS + TANK_SIZE), 0, 0]);

        // dig deep right side
        crater.terrainArray.push([crater.rightEdge.x - 1, crater.rightEdge.y + EXPLOSION_RADIUS, 0, 0]);

        // fill last node of crater terrain
        crater.terrainArray.push([crater.rightEdge.x, crater.rightEdge.y, 0, 0]);

        // keep game terrainintact L and R of crater
        const terrainLeftOfCrater = gameRef.current.terrainArray.filter((nodeX) => nodeX[0] < crater.leftEdge.x);
        const terrainRightOfCrater = gameRef.current.terrainArray.filter((nodeX) => nodeX[0] > crater.rightEdge.x);

        // insert crater terrain into remaining game terrain
        gameRef.current.terrainArray = [...terrainLeftOfCrater, ...crater.terrainArray, ...terrainRightOfCrater];

        refreshScreen();

    };

    //////////////////////////////////////
    // DROP NEARBY TANKS
    const dropNearbyTanks = function (thisShot) {
        // TODO: optimize by only checking nearby tanks rather than all tanks

        // redrop all tanks
        for (let tank of gameRef.current.tankObjects) {
            tank.dropSelf();
        }
        refreshScreen();
    };
    
    const animate = function (ctx,sh1,frameWidth, frameHeight, shiftx, shifty) {
       // ctx.clearRect(sh1.x, sh1.y, frameWidth, frameHeight);

        //draw each frame + place them in the middle
        ctx.drawImage(explosionImg.current, shiftx, shifty,frameWidth, frameHeight,sh1.x-50, sh1.y, frameWidth, frameHeight);

    }
    class Tank {
        constructor(x, playerNumber, canvas, ctx) {
            this.firefire = new Audio("fire.mp3");
            this.canvas = canvas;
            this.ctx = ctx;
            this.x = x;
            this.y = 0;
            this.dropSelf(); // lower from sky until contacts terrain shape
            this.color = PLAYER_COLORS[playerNumber % PLAYER_COLORS.length]; // cycle around options using % if num players bigger than color array
            this.radius = TANK_SIZE;
            this.playerNumber = playerNumber; // NOTE: there is a player 0, but all player numbers displayed to USER are +1
            this.hitpoints = 1;
            this.turret = {
                angle: getRandomInt(180 - (playerNumber / gameRef.current.numHumans + gameRef.current.numRobots) * 180, 180 - ((playerNumber + 1) / (gameRef.current.numHumans + gameRef.current.numRobots)) * 180),
                length: TANK_SIZE * 3,
            };
        }
        dropSelf() {
            this.y = dropItem(this, this.canvas, this.ctx).y;
        }
        // tank methods
        fire() {
            if (this.firefire) {
                this.firefire.currentTime = 0;
                this.firefire.play();
            }
            let angle = this.turret.angle;
            const thisShot = new Bullet(this.x - Math.cos(degreesToRadians(angle)) * EXPLOSION_RADIUS * 1.5, this.y - Math.sin(degreesToRadians(angle)) * EXPLOSION_RADIUS * 1.5);
            let tr = [];
            let hitTank = null;
            // shot placements
            for (let i = 0; i < this.canvas.height * 10; i += 10) {
                
                // cycle through tanks and check if explosion hit each
                for (let idx in gameRef.current.tankObjects) {
                    let tank = gameRef.current.tankObjects[idx];
                    let xProx = Math.abs(tank.x - thisShot.x);
                    let yProx = Math.abs(tank.y - thisShot.y);
                    if (xProx < EXPLOSION_RADIUS && yProx < EXPLOSION_RADIUS) {
                        showExplosion(thisShot,tr);
                        //destroyGround(thisShot);
                        //dropNearbyTanks(thisShot);
                        hitTank = gameRef.current.tankObjects[idx];
                        break;
                    }
                }
                if (hitTank) {
                    hitTank.hitpoints--;

                    // HACK fixes bug where killing self or a tank to the left makes turn skip the next tank to the right
                    if (hitTank.playerNumber <= this.playerNumber) {
                        console.log('kill left neighbor / skip right neighbor bug');
                        gameRef.current.currentPlayerIdx--;
                    }

                    // remove dead tanks from the array
                    const livingTanks = gameRef.current.tankObjects.filter((tank) => tank.hitpoints > 0);
                    gameRef.current.tankObjects = livingTanks;
                    // TODO: this needs to decrement either computers or humans
                    refreshScreen();

                    break;
                }
                // if no tanks were hit, check for ground collision
                else if (hitGround(thisShot, this.ctx, this.canvas)) {
                    showExplosion(thisShot,tr);
                    //destroyGround(thisShot);
                    //dropNearbyTanks(thisShot);

                    break;
                    // explode if went off screen horizontally.
                } else if (offX(thisShot, this.canvas)) {
                    showExplosion(thisShot,tr);
                    break;
                } else {
                   

                    
                   thisShot.y -= TANK_SIZE * Math.sin(degreesToRadians(angle)) - i * GRAVITY; // i gives gravity
                   thisShot.x -= TANK_SIZE * X_BOOSTER * Math.cos(degreesToRadians(angle));
                   tr.push({
                        x: thisShot.x, 
                        y: thisShot.y
                    });
                   
                }
                
            }
        }

    }


    //////////////////////////////////////
    // OFF X - test if an item is horiztonally off-screen
    // had to be explicit with returns, was getting weird errors
    const offX = function (aPoint,canvas) {
        let shotOffX = false;
        if (aPoint.x < 0) {
            shotOffX = true;
        }
        if (aPoint.x > canvas.width) {
            shotOffX = true;
        }
        return shotOffX;
    };
    //////////////////////////////////////
    // DROP ITEM
    // detects top edge of terrain, sets that y value and returns the item
    const dropItem = function (item, canvas, ctx) {
        if (!canvas) {
            canvas = canvasRef.current;
        };
        if (!ctx) {
            ctx = gameRef.current.ctx;
        };
        for (let i = 0; i < canvas.height; i++) {
            item.y++;
            if (hitGround(item,ctx,canvas)) {
                break;
            }
        }

        return item;
    };
    //////////////////////////////////////
    // HIT GROUND
    const hitGround = function (aPoint,ctx,canvas) {
        // redefine but dont draw the terrain again
        defineTerrain(ctx,canvas);
        return ctx.isPointInStroke(aPoint.x, aPoint.y) || ctx.isPointInPath(aPoint.x, aPoint.y);
    };

    class game {
        constructor(numHumans, numRobots, ctx, canvas) {
            this.canvas = canvas;
            this.ctx = ctx;
            this.numHumans = numHumans;
            this.numRobots = numRobots;
        }
        // NEW GAME
        newGame() {
           
            // values for after tanks die so new game can have same number players
            this.numHumansAtStart = this.numHumans;
            this.numRobotsAtStart = this.numRobots;
            this.currentPlayerIdx = 0;
            this.winningPlayer = null;

            clrCanvas(this.ctx);
            // set dom button to show number of current players at game-start
            //$('#num-players-display').text(`: ${this.numHumansAtStart + this.numRobotsAtStart} Players`);

            // populate terrain array
            this.terrainArray = generateTerrain(this.canvas.width, this.canvas.height, TERRAIN_BUMPS, STEEPNESS);

            // DRAW SKY AND GROUND

            // loadClouds(); // this is now set as CSS background on <body>
            drawBackground(this.ctx, this.canvas);

            // CREATE / RECREATE TANK OBJECTS
            this.tankObjects = [];
            for (let ii = 0; ii < this.numHumans + this.numRobots; ii++) {
                // space out tanks evenly along horizontal
                const tank = new Tank(Math.floor((this.canvas.width * (ii + 1)) / (this.numHumans + this.numRobots + 1)), ii, this.canvas,this.ctx);

                this.tankObjects.push(tank);
            }

            //setPlayerDisplay(this.tankObjects[this.currentPlayerIdx].playerNumber);

            // DRAW TANKS
            drawPlayers(this.ctx, this.tankObjects);
        }
        nextPlayersTurn() {
            // cycle thrugh remaing tanks in array
            let nextPlayerIdx = this.currentPlayerIdx + 1;
            if (nextPlayerIdx >= this.tankObjects.length) {
                nextPlayerIdx = 0;
            }
            this.currentPlayerIdx = nextPlayerIdx;
        }
    };
   
    //////////////////////////////////////
    // DRAW PLAYERS
    const drawPlayers = function (ctx, tankObjects) {
        for (let tank of tankObjects) {
            // TANK BODY
            ctx.beginPath();
            ctx.arc(tank.x, tank.y, tank.radius, Math.PI, Math.PI * 2);
            // TANK BODY COLOR
            ctx.fillStyle = tank.color;
            ctx.fill();
            // LIGHT OUTLINE
            ctx.strokeStyle = "#fdf0d5";
            ctx.lineWidth = 3;
            ctx.closePath();
            ctx.stroke();

            // SECOND DARK OUTLINE
            ctx.beginPath();

            ctx.strokeStyle = "#3a3335";

            ctx.arc(tank.x, tank.y, tank.radius + 4, Math.PI, Math.PI * 2);
            ctx.closePath();
            ctx.stroke();

            drawTurret(tank,ctx);
        }
    };
    //////////////////////////////////////
    // DRAW TURRET  rotate, draw straight line, then rotate back
    const drawTurret = function (tank,ctx) {
        ctx.save();
        ctx.translate(tank.x, tank.y);
        ctx.rotate(degreesToRadians(tank.turret.angle));
        
        // BLACK TURRET
        ctx.beginPath();
        ctx.moveTo(-1 * tank.radius, 0);
        ctx.lineTo(-1 * tank.turret.length, 0);
        ctx.lineWidth = 6;
        ctx.stroke();
        
        // WHITE LINE ON TURRET
        ctx.beginPath();
        ctx.moveTo(-1 * tank.radius, 0);
        ctx.lineTo(-1 * tank.turret.length + 5, 0);
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#fdf0d5";
        ctx.stroke();
        ctx.restore();
    };
    //////////////////////////////////////
    // CLEAR CANVAS
    const clrCanvas = function (ctx) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // clear canvas
    };
    //////////////////////////////////////
    // returns random int >= low && < high
    const getRandomInt = function (low, high) {
        return Math.floor(Math.random() * (high - low) + low);
    };
    //////////////////////////////////////
    // DEFINE TERRAIN
    const defineTerrain = function (ctx,canvas) {
        ctx.beginPath();

        let previousPoint = gameRef.current.terrainArray[0];
        let nextPoint = [];

        // random hills
        for (let i = 0; i < gameRef.current.terrainArray.length; i++) {
            //ctx.bezierCurveTo(gameRef.current.terrainArray[i][0] - gameRef.current.terrainArray[i][2], gameRef.current.terrainArray[i][1] - gameRef.current.terrainArray[i][3], gameRef.current.terrainArray[i][0] + gameRef.current.terrainArray[i][2], gameRef.current.terrainArray[i][1] + gameRef.current.terrainArray[i][3], gameRef.current.terrainArray[i][0], gameRef.current.terrainArray[i][1]);
            ctx.lineTo(gameRef.current.terrainArray[i][0], gameRef.current.terrainArray[i][1])
        }
        // connect polygon
        ctx.lineTo(canvas.width, canvas.height); // to bottom right corner
        ctx.lineTo(0, canvas.height); // to bottom left corner
        ctx.closePath(); // back to start
    };

    //////////////////////////////////////
    // generate random elevation ground and sky
    // numSlopes = how many changes in elevatio per screen width. MUST BE > 0
    // steepness = % (currently not implemented)
    const generateTerrain = function (width, height, numSlopes, steepnessPercent) {
        const arr = [];

        for (let i = 0; i <= numSlopes; i++) {
            arr[i] = [width * (i / numSlopes), getRandomInt(height * HORIZON_DEPTH, height), getRandomInt(0, 50), getRandomInt(0, 50)];
        }
        // in case of 0 slopes
        if (numSlopes === 0) {
            arr[1] = arr[0];
        }

        return arr;
    };
    //////////////////////////////////////
    // ADJUST TURRET
    const adjustTurret = function (amount) {
        // TODO: rf send tank to adjust in a arg rather than changing
        let currentTank = gameRef.current.tankObjects[gameRef.current.currentPlayerIdx];
        let angle = currentTank.turret.angle + amount;
        //if (angle < 0) {
        //angle = 180;
        //} else if (angle > 180) {
        //  angle = 0;
        //}
        currentTank.turret.angle = angle;
        refreshScreen();
    };

    //////////////////////////////////////
    // REFRESH SCREEN
    const refreshScreen = function () {
        clrCanvas(gameRef.current.ctx);
        drawBackground(gameRef.current.ctx, gameRef.current.canvas);
        drawPlayers(gameRef.current.ctx, gameRef.current.tankObjects);
    };
    /////////////////////////////////////
    // draws  stored terrain array
    const drawBackground = function (ctx,canvas) {
        
        // BUILD GROUND SHAPE
        defineTerrain(ctx,canvas);
        // THEN DRAW IT
        ctx.fillStyle = '#3a3335';
        ctx.fill();

    };

    const draw = function () {
        gameRef.current.newGame();
    }
    // Create a room channel
    const onPressNewGame = (e) => {
         gameRef.current.newGame();
    }

    const onPressLeft = (e) => {
        // let mouseIsUp = false;
        refreshScreen();
        adjustTurret(-1 * 10 * TURRET_INCREMENT);
    }

    const onPressRight = (e) => {
        refreshScreen();
        adjustTurret(9 * TURRET_INCREMENT);
    }

    const onPressUp = (e) => {
        refreshScreen();
        let fineAdjustmentUp = 1;
        if (gameRef.current.tankObjects[gameRef.current.currentPlayerIdx].turret.angle > 90) {
            fineAdjustmentUp *= -1;
        }
        adjustTurret(fineAdjustmentUp);
    }

    const onPressDown = (e) => {
        refreshScreen();
        // down arrow fine adjusts turret lower on whichever side it's on
        let fineAdjustmentDown = 1;
        if (gameRef.current.tankObjects[gameRef.current.currentPlayerIdx].turret.angle < 90) {
            fineAdjustmentDown *= -1;
        }
        adjustTurret(fineAdjustmentDown);
    }
    const onPressFire = (e) => {
        let currentTank = gameRef.current.tankObjects[gameRef.current.currentPlayerIdx];

        currentTank.fire();
        showDialog();
       
    }
    //////////////////////////////////////
    // GET WINNER
    const getWinner = function () {
        if (gameRef.current.tankObjects.length === 1) {
            // only one tank left in array = alive
            gameRef.current.winningPlayer = gameRef.current.tankObjects[0].playerNumber;
            refreshScreen();
            return true;
        } else return false;
    };
//////////////////////////////////////
        // REFRESH SCREEN
        const showDialog = function () {
            if (getWinner()) {
                Swal.fire({
                    title: "Player " + gameRef.current.winningPlayer +"Is A Big Winner!",
                    text: "'Would You Like New Game?",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes!'
                }).then((result) => {
                    if (result.isConfirmed) {
                        
                        gameRef.current.newGame();
                    }
                    else {
                        
                    }
                })
                
            } else {
                gameRef.current.nextPlayersTurn();
                setcurrentplayer(gameRef.current.tankObjects[gameRef.current.currentPlayerIdx].playerNumber);
            }
        };
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        gameRef.current = new game(DEFAULT_NUM_HUMANS, DEFAULT_NUM_ROBOTS, ctx, canvas);
        gameRef.current.newGame();
    },[])
    useEffect(() => {
        if (firsttime < 2) {
            setfirsttime(1);
            return;
        }
       
        const canvas1 = canvasRef.current;
        const ctx1 = canvas1.getContext('2d');
        let shiftx = 0;
        let frameWidth = 96;
        let frameHeight = 96;
        let rowFrames = 12;
       
        let currentFrame = 0;
        let frameCount = 0;
        let aID
        const renderer = () => {
            if (frameCount > 12) {
               return;
            };
           animate(ctx1, sh1, frameWidth, frameHeight, shiftx, 0)
           

            shiftx += frameWidth + 1;
            /*
              Start at the beginning once you've reached the
              end of your sprite!
            */
            if (currentFrame == rowFrames) {
                shiftx = 0;
                currentFrame = 0;
            }
            

            currentFrame++;
            frameCount++;
            setTimeout(()=>{ aID = requestAnimationFrame(renderer) }, 300)
            
        }
        renderer();
        destroyGround(sh1);
        dropNearbyTanks(sh1)
        if (audio) {
            audio.currentTime = 0;
            audio.play();
        }
        refreshScreen();
        return () => {
            cancelAnimationFrame(aID);
         }
    }, [sh1]);

    useEffect(() => {
        if (firsttime <2) {
            setfirsttime(2);
        }
        const canvas2 = canvasRef.current;
        const ctx2 = canvas2.getContext('2d');
        const drawtr = function (x, y) {
            ctx2.beginPath();
            ctx2.rect(x,y, 4, 4);
            ctx2.stroke();
        }
        for (var i = 0; i < shottr.length; i++) {
            var d = new Date();
            while (new Date() - d <= SHOT_DELAY)
            drawtr(shottr[i].x, shottr[i].y)
        }
        
        
    }, [shottr]);

    return (
        <div>
            <BrowserView>
                < canvas ref={canvasRef} width="1600px" height="800px" style={{ border: 5, backgroundColor: "lightblue" }} />
                <div className="resp-table-footer">
                    <div className="table-footer-cell">
                        <button className="buttongreen"
                            onClick={(e) => onPressNewGame()}
                        >
                            NEW GAME
                        </button>
                    </div>
                    <div className="table-footer-cell">
                        <button
                            className="buttongreen"
                            onClick={(e) => onPressLeft()}
                           >
                           Left
                        </button>
                    </div>
                    <div className="table-footer-cell">
                        <button
                            className="buttongreen"
                            onClick={(e) => onPressUp()}
                        > Slide Left
                        </button>
                    </div>
                    <div className="table-footer-cell">
                        <button
                            className="buttongreen"
                            onClick={(e) => onPressDown()}

                        > Slide Right
                        </button>
                </div>
                <div className="table-footer-cell">
                    <button
                        className="buttongreen"
                        onClick={(e) => onPressRight()}
                    > Right
                    </button>
                </div>
                <div className="table-footer-cell">
                    <button
                        className="buttongreen"
                        onClick={(e) => onPressFire()}

                    > Fire
                    </button>
                    </div>
                </div>
                <div className="table-footer-cell">Current Player:</div>
                <div className="table-footer-cell">
                    {currentplayer}
                </div>
       
            </BrowserView>
            <MobileView>
                < canvas ref={canvasRef} />
            </MobileView>
        </div>
    )
   // return (
        //<div>
        //    <BrowserView>
        //        <iframe
        //            src="entry.html"
        //            width="100%"
        //            height="900"
        //            title="Tanks Main"
        //            style={{ border: 'none' }}
        //            sandbox="allow-scripts allow-popups"
        //        />
        //</BrowserView>
        //    <MobileView>
        //        <iframe
        //            src="entry.html"
        //            width="100%"
        //            height="900"
        //            title="Tanks Main"
        //            style={{ border: 'none' }}
        //            sandbox="allow-scripts allow-popups"
        //        />
        //</MobileView>
        //</div>

   // )

}
export default SaPage
