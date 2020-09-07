//CONSTANTS
var MAXZ = 1000;
var MINZ = 10;
var PLAYERZ = 900;  //not exact, but close enough since I'm doing this with a depth range
var MAXENEMYZ = 800;
var MINENEMYZ = 100;
var MINENEMYY = 100;
var MAXENEMYY = 250;
var TICKTOCK = 5;  //fiddle with this
//base vars
var currentRound = 0;
var personalBest = 0;
var currentScore = 0;
var lives = 0;

var pauseMenu;
var paused = false;

var ducking = false;

var obstacles = [];
var enemies = [];
var targets = [];



function initGame() {
  console.log("initializing Snowball Hero");
  setGameSize(1126, 430);
  setTitle("BP Arcade - Snowball Hero");

  //preload the obstacle assets because canvases are wicked retarded and can't load from a url on their own, the whiny little bitches...
  for (var i=0; i<obstacleList.length; i++) {
    var p = obstacleList[i];
    if (p.type != 'obstacle') continue;
    $('body').append($("<img/>",{id:p.id, src:p.src, class:"offscreen"}));
    preloadedObstacles.push(p);
  }


  //create the pause menu
  pauseMenu = $("<div/>", {
    id:"pauseMenu",
    class:'centerH'
  }).html("<strong>Game Paused</strong><hr/>");

  pauseMenu.append($("<div/>", {
    onclick:"resume()"
  }).html("Resume Game"));

  pauseMenu.append($("<div/>", {
    onclick:"window.location='arcade/snowballhero'"
    }).html("Quit"));

  $("#gameFrame").append(pauseMenu);
  pauseMenu.hide();

  showTitleScreen();
}


//TODO: create a more professional looking layout...with graphics...
function showTitleScreen() {
  gameScreen.empty();

  gameScreen.append('<h1>Snowball Hero!</h1>');  //create graphic
  gameScreen.append("Welcome to the very first game in the Bitty-Pals Arcade!<br /><br />");
  gameScreen.append(
    $('<button/>', {
      id:'playButton',
      class:'none',
      onclick:"startGame()"
    }).html("Play Snowball Hero!")
  );
  gameScreen.append('<br />');
  gameScreen.append(
    $('<button/>', {
      id:'exitButton',
      class:'none',
      onclick:"quit()"
    }).html("Exit to Arcade")
  );

  //TODO: leaderboard

}

function setFreePlay(r) {
  //this will be the handler for the database check on whether or not the player has free plays or needs to pay
  var btn = $("#playButton");
}

function startGame() {
  console.log("Play Game");

  //TODO:check free play/gold before starting game
  showGameScreen();
}

function showGameScreen() {
  console.log("showGameScreen");
  gameScreen.empty();
  showLoading();
  paramQuery({select:['*'], table:'pet', where:'pid = ' + playerID}, petResult);
}
function petResult(r) {
  console.log(r[0]);
  //TODO: going to need to handle multiple pet cases
  //TODO: build pet maquette from parts?

  initPlayScreen();
}




function initRound(rNum) {
  console.log("initializing round " + rNum);
  lives = 3;
  //use currentRound

  //Build Player Tower
  gameScreen.append($("<div/>", { id:'tf', class:'centerH' }));
  gameScreen.append($("<div/>", { id:'tb', class:'centerH' }));
  //Build Player
  gameScreen.append($("<div/>", { id:'playerContainer', class:'centerH'}));

  //TODO: build terrain (generated with levels of depth based on round multiplier...start at 5?)

  initElements(levelVars[rNum]);

  return true;
}

function initElements(vars) {
  console.log("Level Variables:", vars);
  for (var i=0; i<obstacles.length; i++) obstacles[i].el.remove();
  for (var i=0; i<enemies.length; i++) enemies[i].el.remove();

  //get all the obstacle stuff out there.  Canvases are fucking retarded...
  for (var i=0; i<vars.obstacleCount; i++) {
    gameScreen.append('<canvas id="obstacle_'+i+'" class="noselect" width="1100" height="430" style="position:absolute; top:0px; left:0px;"></cavas>');
    var plo = Math.floor(Math.random() * preloadedObstacles.length);  //get a random obstacle object to use from the preloadedObstacles list
    var pl = preloadedObstacles[plo];
    var obstacle = document.getElementById("obstacle_"+i);
    var mtx = obstacle.getContext('2d');
    var img = document.getElementById(pl.id);
    var y = Math.floor(Math.random() * MAXENEMYY);
      y = (y < MINENEMYY) ? y*1 + 100 : y;
      $("#" + obstacle.id).css("z-index", y);
    var x = Math.floor(Math.random() * 750);
    mtx.drawImage(img, x, y);
    obstacles.push({el:obstacle, ob:pl, x:x, y:y});
  }

  //now that the obstacles are out there, we generate the enemies so that we can place them correctly behind the obstacles
  var availableObs = [];
  for (var i=0; i<obstacles.length; i++) availableObs.push(i); //just fill the array with the indices
  var specialCount = 0;
  for (var i=0; i<vars.enemyCount; i++) {
    //TODO: make this shite happen...

    var enemy = enemyList[Math.floor(Math.random() * enemyList.length)];


    //TODO: replace this with Class instance for animation

    var obst = (availableObs.length > 0) ? obstacles[availableObs.shift()] : obstacles[Math.floor(Math.random() * obstacles.length)];
    var y = obst.y*1 + obst.ob.h - enemy.h - 5 - Math.floor(Math.random() * 10);
    var x = Math.floor(Math.random() * obst.ob.w + obst.x - enemy.w);
    if (x < 0) x = 0;
    if ((x + enemy.w) > 1100) x = 1100 - enemy.w;
    //TODO: prevent enemy overlap

    var con = $("<img/>", {
      id:"enemy_" + i,
      src:enemy.src
    })
    con.css({
      position: 'absolute',
      left: x + "px",
      top: y + "px",
      'z-index': obst.y - 1
    })
    enemies.push({el:con, ob:pl, x:x, y:y});
    gameScreen.append(con);
  }
}

function initPlayScreen() {
  if (initRound(currentRound)) {  //wait for init structure
    console.log("initializing play screen");
    var statBar = $("<div/>", {
      id:"statBar",
      class:"noselect"
    });
    statBar.append(
      $("<div/>", {
        class:'statCell noselect',
        style:"float:left"
      }).html('Current Score <span id="cScore">' + currentScore + '</span>')
    );
    statBar.append(
      $("<div/>", {
        id:'cRound',
        class:'statCell noselect'
      }).html('Round <span id="cRound">' + Number(currentRound*1 + 1) + '</span>')
    );
    statBar.append(
      $("<div/>", {
        id:'cBest',
        class:'statCell noselect',
        style:"float:right"
      }).html('Personal Best <span id="cBest">' + personalBest + '</span>')
    );

    // statBar.append(statTable);
    gameScreen.append(statBar);


    //play button
    var rDisp = $("<div/>", {
      id:"rDisp",
      class:"centerH noselect",
      style:"top:100px;z-index:9500;"
      //TODO:style this shite
    }).html("Round " + Number(currentRound*1 + 1) + '<br /><button onclick="beginRound('+Number(currentRound*1 + 1)+')">Start</button><br /><strong><br />Controls:</strong><br /><strong>Click</strong> or <strong>Tap</strong> the screen to throw a snowball.<br />Hold the <strong>Duck</strong> button or the <strong>Space Bar</strong> to dodge incoming snowballs.<br /><strong>Tap</strong> or <strong>Click</strong> the <strong>Pause</strong> button or press <strong>Z</strong> to pause the game.<br /><strong>Good luck!</strong>');
    gameScreen.append(rDisp);
    showArcadeMask();

  } else {
    //round not initialized?
  }
}

function beginRound(roundNum) {
  console.log("begin round " + roundNum);
  hideArcadeMask();
  $("#rDisp").remove();
  var pButton = $("<button/>", {
    id:'pauseButton',
    title:"Pause Game"
  }).html("&#10074;&#10074;");
  pButton.on('mousedown touchstart', function(e) {
    e.stopPropagation(); e.preventDefault();
    pause();
  })
  gameScreen.append(pButton);
  var dButton = $("<button/>", {
    id:'dodgeButton',
    title:"Duck!"
  }).html("duck");
  gameScreen.append(dButton);

  if (!ticking) { startTick(); }

  enableControls();

}
function enableControls() {
  gameScreen.on('mousedown touchstart',
    function(e) {
      if (ducking) return;
      var iSrc = e;
      if (e.targetTouches != undefined) {
        iSrc = e.targetTouches[0];
      }
      var moX = iSrc.pageX - gameScreen.offset().left;
      var moY = iSrc.pageY - gameScreen.offset().top;
      fire({x:moX, y:moY});
    });

  $("#dodgeButton").on('mousedown touchstart', function(e) {
    e.stopPropagation(); e.preventDefault();
    duck();
  });
  $("#dodgeButton").on('mouseup touchend', function(e) {
    e.stopPropagation(); e.preventDefault();
    stand();
  });
  $(document).off('keypress');
  $(document).on('keypress', function(e) {
    if (e.which == 32) {
      e.preventDefault();
      e.stopPropagation();
      duck();
    } else if (e.which == 122) {
      e.preventDefault();
      e.stopPropagation();
      pause();
    }
  });
  $(document).on('keyup', function(e) {
    if (e.which == 32) {
      e.preventDefault();
      e.stopPropagation();
      stand();
    }
  });
}
function disableControls() {
  gameScreen.off('mousedown touchstart');
  $("#dodgeButton").off('mousedown touchstart');
  $("#dodgeButton").off('mouseup touchend');
  $(document).off('keypress');
  $(document).off('keyup');
}

//GAME PLAY CONTROLS
function pause() {
  console.log("pause");
  pauseGame();  //gameUtils
  paused = true;
  disableControls();
  $("#pauseButton").off('mousedown touchstart');
  $("#pauseButton").on('mousedown touchstart', function(e) {
    e.stopPropagation();
    resume();
  })
  $("#pauseButton").attr('title', "Resume Game");
  $("#pauseButton").html("&#9658;");
  $(document).off('keypress');
  $(document).on('keypress', function(e) {
    if (e.which == 122) { resume(); }
  })
  showArcadeMask();
  pauseMenu.show();
}

function resume() {
  console.log("resume");
  resumeGame();  //gameUtils
  paused = false;
  enableControls();
  $("#pauseButton").off('mousedown touchstart');
  $("#pauseButton").on('mousedown touchstart', function(e) {
    e.stopPropagation();
    pause();
  })
  $("#pauseButton").attr('title', "Pause Game");
  $("#pauseButton").html("&#10074;&#10074;");

  pauseMenu.hide();
  hideArcadeMask();

}

function quit() {
  console.log('quit');
  disableControls();
  exitGame();
}

function showArcadeMask() {
  var am = $("<div/>",{ id:'arcadeMask' });
  gameScreen.append(am);
}
function hideArcadeMask() {
  $("#arcadeMask").remove();
}


//GAME METHODS
function addScore(val) {
  console.log("addScore: " + val);
}
function duck() {
  if (ducking) return;
  console.log("duck");
  ducking = true;
}
function stand() {
  console.log("stand");
  ducking = false;
}
function fire(mCoords) {
  if (ducking || paused) return;
  console.log("FIRE!", mCoords);
  var sb = new Snowball({target:mCoords});
  if (sb.init()) sb.fire();
}
function killme(instance) {
  delete instance;
}
