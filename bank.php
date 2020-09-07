
<?php
require_once "overhead.php";
if (!isset($_SESSION['player_id'])) header("Location: http://bittypals.com");

?>
<!DOCTYPE html>

<html>
<head>
<title>BittyBank</title>
<?php echo $requiredHead; ?>
<script src="js/pp.js?v=<?php echo mktime(); ?>"></script>
<script src="https://www.paypalobjects.com/api/checkout.js"></script>



<script>
  <?php echo $baseJSVars; ?>

  $('document').ready(function() {
    <?php echo $onReady; ?>
    setPage("Bank");
    currentPage = "bank";
    updatePlayerMoney(playerID);

    var ppButtons = [
      {a:'5.00',t:'gold',c:500,g:'btn5'},
      {a:'10.00',t:'gold',c:1200,g:'btn10'},
      {a:'25.00',t:'gold',c:3200,g:'btn25'},
      {a:'50.00',t:'gold',c:7000,g:'btn50'}
    ];
    for (var i=0; i<ppButtons.length; i++) {
      var b = ppButtons[i];
      getPPButton(b.a, b.t, b.c, b.g);
    }
  })


</script>
<style>
  .stack_list {
    position:relative;
    width:100%;
    display:inline;
  }
  .stack {
    position:relative;
    display:inline-block;
    width:20%;
  }
</style>
</head>
<body class="site">
<?php echo $alertPanes; ?>

  <main class="site_content"><center>
    <?php echo $playerTab; ?>
    <div id="gameFrame" class="game_frame content">

      <?php echo $gameHeader; ?>
      <div class="static_content dynamic">
        <div class="landing_lower">
          <h1>Welcome to Bitty Savings and Loan!</h1>
          We're still patching our walls up, but our vault is secure!
          <br />We use PayPal as a secure way for you to purchase Gold Coins to use in BittyPals.
          <br />Don't have a PayPal account?  No problem!  The secure transaction accepts credit/debit cards without one.
          <br />No personal details are sent to our site from the PayPal hosted payment box that pops up.
          <br />
          <br />
          <div class="stack_list">
            <div class="stack">
              500<img src="assets/site/coin-gold.png" /><br />$5<br />
              <div id="btn5"></div>
            </div>
            <div class="stack">
              1200<img src="assets/site/coin-gold.png" /><br />$10<br />
              <div id="btn10"></div>
            </div>
            <div class="stack">
              3200<img src="assets/site/coin-gold.png" /><br />$25<br />
              <div id="btn25"></div>
            </div>
            <div class="stack">
              7000<img src="assets/site/coin-gold.png" /><br />$50<br />
              <div id="btn50"></div>
            </div>
          </div>


        </div>
      </div>
    </div>
  </center></main>
  <?php echo $footer; ?>
</body>
</html>
