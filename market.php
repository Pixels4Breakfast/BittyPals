
<?php
require_once "overhead.php";

  if (!isset($_SESSION['player_id'])) header("Location: home");
?>
<!DOCTYPE html>

<html>
<head>
<title>BittyPals Marketplace</title>
<?php echo $requiredHead; ?>
<?php
  includeJSDir('js/widgets/');
?>
<script src="js/market.js?v=<?php echo mktime(); ?>"></script>
<script src="js/animateSprite.js?v=<?php echo mktime(); ?>"></script>
<script src="js/Sprite.js?v=<?php echo mktime(); ?>"></script>
<script src="js/Effect.js?v=<?php echo mktime(); ?>"></script>
<script src="js/inventory.js?v=<?php echo mktime(); ?>"></script>

<script>
  <?php echo $baseJSVars; ?>
  $('document').ready(function() {
    <?php echo $onReady; ?>
    setPage("Market");
    updatePlayerMoney(playerID);
    $(".pdate").remove();

    $("#searchField").on("keypress",function(e){if(e.keyCode==13){searchInventory();}});
    paramQuery(cParams, loadCats);  //getting the categories for nav
    searchInventory();  //this loads the marketplace
    setLowerTitle();
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

          <div id="inventoryContent">
            <div class="section_header">Marketplace</div>
            <div id="lowerTitle"></div>
            <table style="width:100%; border-collapse:collapse;"><tr>
              <td id="inventoryNav" class="inventory_nav" rowspan="3">
                <?php echo $inventorySearch.$shoppingBag; ?>
              </td>
              <td style="border-top:1px solid black;"><?php echo $breadCrumb; ?></td>
              <tr><td id="inventoryList" class="inventory_list">
                <ul id="itemBlocks"></ul>
              </td></tr>
              <tr><td style="border-top:1px solid black;"><?php echo $breadCrumb; ?></td></tr>
            </table>
          </div>

        </div>
      </div>
    </div>
  </center></main>
  <?php echo $footer; ?>
</body>
</html>
