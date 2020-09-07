
<?php
require_once "overhead.php";
if (isset($_SESSION['player_id'])) {
  $pid = $_SESSION['player_id'];
} else {
  header("Location:home");
}

$timestamp = date("His");

$requiredHead .= '<script src="js/games/gameUtils.js?v='.$timestamp.'"></script>';
//this should always be a string equivelant to the js file associated with the game
$gameName = "nogame";
if (isset($_GET['gamename'])) {
  $gameName = $_GET['gamename'];
  // $requiredHead .= '<script src="js/games/jCanvas.js"></script>';  //ugh...
  $requiredHead .= '<script src="js/games/'.$gameName.'/variables.js?v='.$timestamp.'"></script>';  //variables MUST be loaded before game initialization
  $requiredHead .= '<script src="js/games/'.$gameName.'.js?v='.$timestamp.'"></script>';
}



?>
<!DOCTYPE html>

<html>
<head>
<title>Bitty-Pals Arcade</title>
<?php echo $requiredHead; ?>

<script>
  <?php echo $baseJSVars; ?>
  var gameName = "<?php echo $gameName; ?>";
  //some basic variables that all of the games will be using
  var gameScreen;

  $('document').ready(function() {
    <?php echo $onReady; ?>
    setPage("Games");
    currentPage = "games";
    gameScreen = $('#gameScreen');
    updatePlayerMoney(playerID);

    if (gameName != 'nogame') {
      loadModules();
      loadStyles();
      initGame();
    } else {
      setTitle("Bitty-Pals Arcade");
    }
  })
</script>

</head>
<body class="site">
<?php echo $alertPanes; ?>

  <main class="site_content"><center>
    <?php echo $playerTab; ?>
    <div id="gameFrame" class="game_frame content">

      <?php echo $gameHeader; ?>
      <div class="static_content dynamic">
        <div id="gameScreen" class="landing_lower">


          <?php if ($gameName == 'nogame'): ?>

            <!-- //TODO: Create game preview graphics, pull from DB, make links, yadda yadda.  Can placehold for now.<br /> -->
            <!-- <a href="arcade/snowballhero">Temp link to Snowball Hero</a><br /> -->
            <div style="text-align:center; cursor:pointer;">
              <table style="width:100%;">
                <td colspan="2" style="font-size:1.5em">Bitty Matchup</th>
                <tr onclick="window.location='arcade/bittymatchup'" title="Play Bitty Matchup">
                  <td style="width:30%; text-align:right; vertical-align:top;"><img src="assets/arcade/bittymatchup/preview.png" /></td>
                  <td style="vertical-align:top; text-align:left;">
                    The very first Bitty-Pals Arcade game is finally here!
                    <br /><br />
                    Think your memory is pretty good?  Want to win gold and prizes?
                    <br />
                    Think your memory is terrible, but <em>still</em> want to win gold and prizes?
                    <br /><br />
                    Then this is the game for you!
                    <br />
                    We all know this game.  Just match up the images hidden under the boxes to earn points and gold.  Get good enough at it, or just play enough games and you could win prized items and coveted trophies as well!
                    <br /><strong>Click anywhere to play!</strong>
                    <br />
                    <br /><strong>A Note From Squishy:</strong><br />
                    <span style="color:darkRed; font-weight:bold;">Some features aren't quite implemented yet, such as the prizes, trophies, and leaderboard, but you can still play and win Gold Coins until I get them in over the next couple of days :)
                  </td>
                </tr>
              </table>
            </div>
            <!-- <a href="arcade/bittymatchup">Temp link to Bitty Matchup</a> -->

          <?php endif; ?>


        </div>
      </div>
    </div>
  </center></main>
  <?php echo $footer; ?>
</body>
</html>
