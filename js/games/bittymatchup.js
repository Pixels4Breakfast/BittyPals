/*
  Basic concentration style game for Bitty-Pals Arcade
  Prototype: June 2018 Flint Anderson (Squishy)
*/

var cards = [];  //this will also correlate to the grid positions
var tiles = [];
var gameBoard = undefined;
var tileBox = undefined;
var cell1 = undefined;
var cell3 = undefined;
var animating = false;  //do I need this?
var tileCount = 0;
var useClass = "";
var cardOne = undefined;
var cardTwo = undefined;
var noclick = false;
var autoBuy = false;

var titleState = undefined;
var gameState = undefined;

var round = 0;
var flipChances = 0;
var baseFlips = 0;
var bonusPoints = 0;
var goal = 0;
var found = 0;

var roundScore = 0;
var roundBonus = 0;
var totalScore = 0;
var totalBonus = 0;
var highScore = 0;
var highBonus = 0;
var highWinnings = 0;
var roundWinnings = 0;
var totalWinnings = 0;

var multiplier = 2;  //base mult.  If they buy an extra flip, this changes to 1

//graphic elements
var scoreBox = undefined;
var bonusBox = undefined;
var tScoreBox = undefined;
var tBonusBox = undefined;
var hScoreBox = undefined;
var hBonusBox = undefined;
var winningsBox = undefined;
var tWinningsBox = undefined;
var hWinningsBox = undefined;

var flipsBox = undefined;



function initGame() {
  console.log("initializing Bitty Matchup");
  setGameSize(1126, 430, 0);
  setTitle("BP Arcade - Matchup");

  loadGameSounds();
  loadingScreen = $("<div/>", {class:'loading_screen'}).html("LOADING...");
  gameScreen.append(loadingScreen);
  generateStates(true);
}
function loadGameSounds() {
  var sPath = "assets/arcade/bittymatchup/sounds/";

  loadSoundList(sPath, soundList);
}



function generateStates(showTitle) {
                                       //Title State
  titleState = $("<div/>", {id:"titleState", style:"position:absolute; height:100%; width:100%;"})

  titleState.append('<h1>Bitty Matchup!</h1>');  //create graphic
  var infoButton = $("<button/>", {
    html:"Game Information",
    title:"Game Information",
    class:"info_button blue_button",
    style:"width:auto;",
    onclick:"showRules()"
  });
  titleState.append(infoButton);
  titleState.append("<br />Welcome to the very first game in the Bitty-Pals Arcade!<br />This is a simple memory game.  Just flip the cards and match them up to win gold and prizes!<br />Each game will cost you 25 <img src=\"assets/site/coin-gold.png\" /> to play.<br /><br />Choose your difficulty:<br />");


  var preTable = $("<table/>");
  var preRow = $("<tr/>");
  var preCell1 = $("<td/>");
  var preCell2 = $("<td/>");
  preCell1.append($("<img/>", { src:imgPath + "preview.png", height:128}));

  preCell2.append($('<button/>', { id:'playButton', class:'none', style:"width:200px;height:40px;margin:2px", onclick:"loadGame(4)" }).html("Easy (4x4, 7 chances)"), "<br />");
  preCell2.append($('<button/>', { id:'playButton', class:'none', style:"width:200px;height:40px;margin:2px", onclick:"loadGame(6)" }).html("Medium (6x6, 15 chances)"), "<br />");
  preCell2.append($('<button/>', { id:'playButton', class:'none', style:"width:200px;height:40px;margin:2px", onclick:"loadGame(8)" }).html("Hard (8x8, 30 chances)"), "<br />");
  preRow.append(preCell1, preCell2);
  preTable.append(preRow);
  titleState.append(preTable);




  titleState.append('<br />');
  titleState.append(
    $('<button/>', {
      id:'exitButton',
      class:'none',
      onclick:"quit()"
    }).html("Exit to Arcade")
  );
  gameScreen.append(titleState);
  titleState.hide();

                                        //Game State
  gameState = $("<div/>", {id:"gameState", style:"position:absolute; height:430px; width:1100px;"})
  cell1 = $("<div/>", {id:'cell1'});

    //round score/bonus
    var roundBoxes = $("<div/>", {style:"margin-left:10px;"});
    scoreBox = $("<span/>", {
      id:"display_roundScore",
      class:"scorebox"
    }).html(roundScore);
    bonusBox = $("<span/>", {
      id:"display_roundBonus",
      class:"bonusbox"
    }).html(roundBonus);
    winningsBox = $("<span/>", {
      id:"display_roundWinnings",
      class:"scorebox"
    }).html(roundWinnings);
    roundBoxes.append(scoreBox, " X ", bonusBox, " = ", winningsBox, "<img src=\"assets/site/coin-gold.png\" />");
    cell1.append("<strong>&nbsp;&nbsp;Round Score</strong><br />", roundBoxes);


    //chances left
    var flipsDisp = $("<div/>", {style:"margin-left:10px;"});
    flipsBox = $("<span/>", {
      id:"display_flipChances",
      // style:"font-size:2em;"
      class:"bonusbox"
    }).html(flipChances);
    flipsDisp.append("<strong>Chances Left: ", flipsBox);
    cell1.append("<br />", flipsDisp);


    //total score/bonus/winnings
    var totalBoxes = $("<div/>", {style:"margin-left:10px;"});
    tScoreBox = $("<span/>", {
      id:"display_totalScore",
      class:"scorebox totals"
    }).html(totalScore);

    tBonusBox = $("<span/>", {
      id:"display_totalBonus",
      class:"bonusbox totals"
    }).html(totalBonus);

    tWinningsBox = $("<span/>", {
      id:"display_totalWinnings",
      class:"scorebox totals"
    }).html(totalWinnings);
    totalBoxes.append("Total Score: ", tScoreBox, "<br />Bonus Points: ", tBonusBox, "<br />Winnings: ", tWinningsBox, "<img src=\"assets/site/coin-gold.png\" />");
    cell1.append("<br /><br /><strong>&nbsp;&nbsp;Totals:</strong><br />", totalBoxes);


    //auto-buy chances
    var autoBuyButton = $("<button/>", {
      id:"autoBuyButton",
      title:"Activating this button will automatically buy chances for flips when you run out",
      html:"Activate",
      class:"auto_button",
      onclick:"autoFlip()"
    })
    cell1.append("<br />&nbsp;&nbsp;Auto-buy flip chances for 10<img src=\"assets/site/coin-gold.png\" /> each<br />", autoBuyButton);

    //exit game
    var exitButton = $("<button/>", {
      html:"Collect Winnings and Exit Game",
      class:"exit_game",
      onclick:"endGame()"
    });
    cell1.append(exitButton);


                                                  //RIGHT CELL
  cell3 = $("<div/>", {id:'cell3'});
    var infoBox = $("<div/>", {
      id:"bmInfoBox"
    });
    var infoButton = $("<button/>", {
      html:"?",
      title:"Game Information",
      class:"info_button blue_button",
      onclick:"showRules()"
    });
    infoBox.append(infoButton);
    cell3.append(infoBox);

    //personal high score/bonus
    /*
    var highBoxes = $("<div/>", {style:"margin-left:10px;"});
    hScoreBox = $("<span/>", {
      id:"display_highScore",
      class:"scorebox totals"
    }).html(highScore);

    hBonusBox = $("<span/>", {
      id:"display_highBonus",
      class:"bonusbox totals"
    }).html(highBonus);

    hWinningsBox = $("<span/>", {
      id:"display_highWinnings",
      class:"scorebox totals"
    }).html(highWinnings);
    highBoxes.append("Lifetime Score: ", hScoreBox, "<br />Lifetime Bonus Points: ", hBonusBox, "<br />Lifetime Winnings: ", hWinningsBox, "<img src=\"assets/site/coin-gold.png\" />");
    cell3.append("<br /><br /><strong>&nbsp;&nbsp;Lifetime:</strong><br />", highBoxes);
    */
    //leaderboard (top ten?)

    cell3.append("<strong>COMING SOON:</strong><br />Lifetime Accumulated Stats<br />Leaderboard<br />Trophies<br />Prize Items");


  gameBoard = $("<div/>", {id:'gameBoard'});
  tileBox = $("<div/>", {id:'tileBox'});
  gameBoard.append(tileBox);


  gameState.append(cell1, gameBoard, cell3);

  gameScreen.append(gameState);
  gameState.hide();

  loadingScreen.hide();
  if (showTitle) {
    titleState.show();
    // sounds.loop1.loop();
    // sounds.loop1.autoplay();
  }
}



function loadGame(diff) {
  if (getPlayerMoney().gold < 25) {
    console.log("insufficient funds");
    swal({
      title:"Uh-oh!  You don't have enough gold for the arcade!",
      text:"You don't have enough gold for the arcade.<br />Each game costs 25 <img src=\"assets/site/coin-gold.png\" />",
      html:true,
      showCancelButton:true,
      closeOnConfirm:true,
      closeOnCancel:true,
      confirmButtonText:"Buy More Gold",
      cancelButtonText:"Dernit"
    },
    function (isConfirm) {
      if (isConfirm) {
        window.location = 'bank';
      } else {
        //do nothing
        // setTimeout(endGame, 500);
      }
    });

  } else {
    showGameScreen(diff);
  }
}

function showGameScreen(diff) {
  titleState.hide();
  gameState.show();
  tileBox.empty();
  tiles = [];
  cardOne = cardTwo = undefined;
  tileCount = Number(diff * diff);
  console.log("Initializing game screen with " + tileCount + " tiles");



  var tileMargin = 0;
  var tileSize = 0;
  var gtc = "";
  switch(diff) {
    case 4:
      setGutter(15);
      tileMargin = "2px";
      useClass = "img96";
      gtc = "auto auto auto auto";
      baseFlips = 9;
    break;
    case 6:
      setGutter(5);
      tileMargin = "2px";
      useClass = "img66";
      gtc = "auto auto auto auto auto auto";
      baseFlips = 17;
    break;
    case 8:
      setGutter(15);
      tileMargin = "1px";
      useClass = "img48";
      gtc = "auto auto auto auto auto auto auto auto";
      baseFlips = 36;
    break;
    default:
      console.error("Invalid difficulty value: " + diff);
    break;
  }


  tileBox.css("grid-template-columns", gtc);
  for (var i=0; i<tileCount; i++) {
    var tile = $("<div/>", {
      id: "tile_" + i,
      class:"tile " + useClass
    });
    tiles.push(tile);
    tileBox.append(tile);
  }

  buildGame();

}

function setGutter(v) {
  tileBox.css("padding", v + "px");
  var dim = 430 - v*2;
}


function buildGame() {
  givePlayerMoney(playerID, {gold:-25});
  gq({pid:playerID, amount:25}, trackGold, 'spent_gold');
  var imgSet = cardImageSets[Math.floor(Math.random()*cardImageSets.length)];
  var cardNum = 0;
  flipChances = baseFlips;
  roundScore = 0;
  roundBonus = flipChances;
  roundWinnings = 0;
  goal = tileCount/2;
  found = 0;

  setVal("flipChances", flipChances);
  setVal("totalScore", totalScore);
  setVal("totalBonus", totalBonus);
  setVal("totalWinnings", totalWinnings);
  setScore();

  var setPath = imgPath + imgSet.folder + "/" + imgSet.prefix;

  cards = [];  //clear out the old card set
  for (var i=0; i<tileCount; i++) {
    var cardOb = {cardID:cardNum, src:setPath + cardNum + "." + imgSet.suffix, backer:imgPath + cardBacker, class:useClass, sound:new Sound("assets/arcade/bittymatchup/sounds/cardFlip.mp3")};
    var card = new Card(cardOb);
    cards.push(card);
    if ((i + 1)%2 == 0) cardNum++;
  }

  cards.sort(function(a, b){return 0.5 - Math.random()});

  for (var k=0; k<cards.length; k++) {
    tiles[k].empty();
    cards[k].init(tiles[k]);
  }
  noclick = false;
  // setTimeout(flipAll, 500);
  // setTimeout(flipAll, 1000);
  setTimeout(flipAllByRow, 500);
}

var f = 0;
function flipAll() {
  if (f<cards.length) {
    cards[f].flip();
    f++;
    setTimeout(flipAll, 100);
  } else {
    f = 0;
    noclick = false;
  }
}


var cardRows = [];
function flipAllByRow() {
  //break out the card rows
  var rowCount = Math.sqrt(cards.length);
  var cc = 0;
  for (var r=0; r<rowCount; r++) {
    var cCards = [];
    for (var c=0; c<rowCount; c++) {
      cCards.push(cc);
      cc++;
    }
    cardRows.push(cCards);
  }

  var delay = 0;
  var delay2 = 750;
  for (var f=0; f<rowCount; f++) {
    var shift = (rowCount == 4) ? 750 : (rowCount == 6) ? 500 : 250;
    setTimeout(flipRow.bind(null, cardRows[f]), delay);
    delay = delay*1 + shift;
    setTimeout(flipRow.bind(null, cardRows[f]), delay2);
    delay2 = delay2*1 + shift;
  }
  cardRows = [];
}
function flipRow(row) {
  for (var i=0; i<row.length; i++) cards[row[i]].flip();
}


function flipCard(id) {
  if (noclick) return;
  //do they have free flips left?
  var card = cards[id];
  var flag = false;
  if (card.showing) {
    //ain't doin' nuthin'
  } else {
    if (noclick) return;  //redundancy for redundancy's sake
    if (cardOne == undefined) {
      cardOne = card;
      flag = true;
    }
    if (!flag) {
      cardTwo = card;
      noclick = true;
    }
    card.flip();
  }
  if (cardOne != undefined && cardTwo != undefined) checkMatch();
}



function checkMatch() {
  if (cardOne.cardID == cardTwo.cardID) {
    setTimeout(matchFound, 1000);
  } else {
    setTimeout(noMatch, 1000);
  }
}

function noMatch() {
  sounds.noMatch.play();
  cardOne.flip();
  cardTwo.flip();
  cardOne = cardTwo = undefined;
  flipChances--;
  setVal("flipChances", flipChances);
  setScore();
  if (flipChances == 0) {
    //give players the option to buy more chances or auto-buy
    if (autoBuy ) {
      buyFlip();
    } else {
      //play out of chances sound
      swal({
        title:"Uh-oh!  You're out of free flips.<br />Would you like to buy another flip for 10<img src=\"assets/site/coin-gold.png\" />?",
        html:true,
        showCancelButton:true,
        closeOnConfirm:true,
        closeOnCancel:true,
        confirmButtonText:"I'm almost there!",
        cancelButtonText:"Nope.  I'll take my winnings and go."
      },
      function (isConfirm) {
        if (isConfirm) {
          setTimeout(buyFlip, 500);
        } else {
          setTimeout(endGame, 500);
        }
      });
    }
  }

  noclick = false;
}


function matchFound() {
  sounds.matchFound.play();
  cardOne.remove();
  cardTwo.remove();
  cardOne = cardTwo = undefined;
  //add to score
  roundScore++;
  setScore();

  found++;
  if (found == goal) {
    sounds.win.play();
    totalScore = totalScore*1 + roundScore*1;
    totalBonus = totalBonus*1 + roundBonus*1;


    setScore();
    if (flipChances == baseFlips) {
      //double the gold they get if they get a perfect set
      roundWinnings = roundWinnings * 2;
      totalWinnings = totalWinnings*1 + roundWinnings*1;
      swal({
        title:"Wow!  You had a perfect game, doubling your round winnings!<br />You have won " + roundWinnings + "<img src=\"assets/site/coin-gold.png\" /> this round!",
        html:true,
        closeOnConfirm:true,
        confirmButtonText:"Awesome!"
      }, function(isConfirm) {
        if (isConfirm) setTimeout(roundWin, 500);
      });
    } else {
      totalWinnings = totalWinnings*1 + roundWinnings*1;
      setTimeout(roundWin, 500);
    }
}

function roundWin() {
  swal({
    title:"Congratulations!",
    text:"You have completed this round.<br />Your winnings are currently at " + totalWinnings + "<img src=\"assets/site/coin-gold.png\" /><br />Would you like to play again for 25<img src=\"assets/site/coin-gold.png\" />?",
    html:true,
    showCancelButton:true,
    closeOnConfirm:true,
    closeOnCancel:true,
    confirmButtonText:"Yes!",
    cancelButtonText:"Nope.  I'll take my winnings and go."
  },
  function (isConfirm) {
    if (isConfirm) {
      buildGame();
    } else {
      setTimeout(endGame, 500);
    }
  });
}

noclick = false;
}

function buyFlip() {
  if (getPlayerMoney().gold < 10) {
    swal({
      title:"Oops!",
      text:"You don't have enough gold for another flip.<br />Each flip costs 10 <img src=\"assets/site/coin-gold.png\" />",
      html:true,
      // showCancelButton:true,
      closeOnConfirm:true,
      closeOnCancel:true,
      confirmButtonText:"Schucks.  Okay.",
      // cancelButtonText:"Dernit"
    },
    function (isConfirm) {
      if (isConfirm) {
        setTimeout(endGame, 500);
        // window.location = 'bank';
      } else {
        //do nothing
        // setTimeout(endGame, 500);
      }
    });
  } else {
    givePlayerMoney(playerID, {gold:-10});
    gq({pid:playerID, amount:10}, trackGold, 'spent_gold');
    flipChances++;
    setScore();
    setVal("flipChances", flipChances);
  }
}


function setScore() {
  roundBonus = flipChances;
  roundWinnings = roundScore * roundBonus;

  setVal("roundScore", roundScore);
  setVal("roundBonus", flipChances);
  setVal("roundWinnings", roundWinnings);


}

function setVal(target, value) {
  $("#display_" + target).html(value);
}



function autoFlip() {
  if (autoBuy) {
    autoBuy = false;
    $("#autoBuyButton").removeClass("glowing_button");
    $("#autoBuyButton").html("Activate");
  } else {
    autoBuy = true;
    $("#autoBuyButton").addClass("glowing_button");
    $("#autoBuyButton").html("Deactivate");
  }
}


function endGame() {
  if (totalWinnings > 0) {
    givePlayerMoney(playerID, {gold:totalWinnings});
    gq({pid:playerID, amount:totalWinnings}, trackGold, 'won_gold');
    swal({
      title:"Congratulations!",
      text:"You have won " + totalWinnings + "<img src=\"assets/site/coin-gold.png\" />!<br />Come back soon!",
      html:true,
      closeOnConfirm:true,
      confirmButtonText:"Yay!"
    }, function(isConfirm) {
      if (isConfirm) toTitle();
    });
  } else {
    swal({
      title:"Oh noes!",
      text:"You haven't earned any winnings this time around,<br />but come back to try your luck again!",
      html:true,
      closeOnConfirm:true,
      confirmButtonText:"I will!"
    }, function(isConfirm) {
      if (isConfirm) toTitle();
    });
  }
}

function toTitle() {
  roundScore = roundBonus = totalScore = totalBonus = flipChances = bonusPoints = goal = found = roundWinnings = totalWinnings = 0;
  setVal("roundScore", roundScore);
  setVal("roundBonus", roundBonus);
  setVal("totalScore", totalScore);
  setVal("totalBonus", totalBonus);
  setVal("roundWinnings", roundWinnings);
  setVal("totalWinnings", totalWinnings);
  gameState.hide();
  titleState.show();
}


function trackGold(r) {
  if (r != "success") {
    console.error(r);
  }
}

function quit() {
  exitGame();
}
