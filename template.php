
<?php
require_once "overhead.php";
if (isset($_SESSION['player_id'])) {
  $pid = $_SESSION['player_id'];
} else {
  header("Location:home");
}

?>
<!DOCTYPE html>

<html>
<head>
<title>BittyPals</title>
<?php echo $requiredHead; ?>

<script>
  <?php echo $baseJSVars; ?>

  $('document').ready(function() {
    setPage("Home");
    currentPage = "home";
    updatePlayerMoney(playerID);


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
        <div class="landing_lower">
          PlaceHolder

        </div>
      </div>
    </div>
  </center></main>
  <?php echo $footer; ?>
</body>
</html>
