
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
<title>Bitty-Pals Store</title>
<?php echo $requiredHead; ?>
<?php
  includeJSDir('js/widgets/');
?>
<script src="js/pp.js?v=<?php echo mktime(); ?>"></script>
<script src="https://www.paypalobjects.com/api/checkout.js"></script>
<script src="js/store.js?v=<?php echo mktime(); ?>"></script>
<link rel="stylesheet" href="css/store.css" />


<script>
  <?php echo $baseJSVars; ?>

  $('document').ready(function() {
    setPage("Store");
    currentPage = "store";
    updatePlayerMoney(playerID);
    $("#habName").html("Bitty-Pals Store");

    new Pane('store', $("#storePane")).register();
    new Pane('cart', $("#cartPane")).register();

    showStore();
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

          <div id="storePane">
            <span id="storeInst">Click on an item to see its details!</span>
            <br /><br />
            <div class="stack_list" id="storeList">
              <!-- this will be generated dynamically -->
            </div>
            <hr />
            <div class="stack_list">
              <div class="stack"><strong>Subtotal: $</strong><span id="subt" class="subtotalbox">0</span></div>
              <div class="stack"><button type="button" class="blue_button" onclick="showPane('cart')">Go to Cart and Checkout</button></div>
            </div>
          </div>

          <div id="cartPane">
            <button type="button" class="blue_button" style="width:200px;" onclick="showPane('store')">Back to Store</button>
            <ul id="cartList"></ul>
            <hr />
            <div class="stack_list">
              <div class="stack"><strong>Total: $</strong><span id="subt" class="subtotalbox">0</span></div>
              <div class="stack"><button type="button" class="blue_button" id="ccButton" onclick="updatePPButton()">Checkout</button></div>
              <div class="stack"><div id="storeButton"></div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </center></main>
  <?php echo $footer; ?>
</body>
</html>
