
<?php
require_once "overhead.php";

?>
<!DOCTYPE html>

<html>
<head>
<title>BittyPals Terms and Conditions</title>
<?php echo $requiredHead; ?>

<script>
  <?php echo $baseJSVars; ?>




  $('document').ready(function() {
    if (playerID != 0) {
      setPage("Home");
      currentPage = "tac";
      updatePlayerMoney(playerID);
    }
  })



</script>


</head>
<body class="site">
<?php echo $alertPanes; ?>


  <main class="site_content"><center>
    <?php if (isset($_SESSION['player_id'])) : ?>
      <div class="pt_justifier">
        <div class="player_tab" onclick="showPlayerMenu();" title="Log Out">Log Out</div>
      </div>
    <?php endif; ?>
    <div id="gameFrame" class="game_frame content">

      <?php echo (isset($_SESSION['player_id'])) ? $gameHeader : $simpleHeader; ?>
      <div class="static_content dynamic">
        <div class="landing_lower" style="display:inline-block;">
          <h1>Terms and Conditions</h1>

          <iframe src="https://docs.google.com/gview?url=https://bittypals.com/legal/BittyPalsTermsAndConditions.doc&embedded=true" width="1100px" height="623px"></iframe>


        </div>
      </div>
    </div>
  </center></main>
  <?php echo $footer; ?>
</body>
</html>
