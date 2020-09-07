
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
  var nOffset = 0;
  var nPage = 0;
  var nLimit = 10;
  var rowcount = 0;

  $('document').ready(function() {
    <?php echo $onReady; ?>
    setPage("News");
    updatePlayerMoney(playerID);
    loadNews();
  })

  function loadNews() {
    paramQuery({ select:["*"], table:"news", rowcount:true, limit:nLimit, order:["id","DESC"], offset:nOffset }, displayNews);
  }

  function displayNews(r) {
    console.log("displayNews:" ,r);
    var n = $("#newsContent");
    n.empty();
    n.append('<div style="width:100%; font-size:1.8em; font-weight:bold; text-align:center;">The Bitty Post</div><div class="bc_nav" style="margin-left:20px;"></div><hr />');
    for (var i=0; i<r.length; i++) {
      var article = r[i];
      console.log("article: ", article);
      if (article.rowcount != undefined) {
        rowcount = article.rowcount;
        continue;
      }
      var display = $("<div/>",{ style:"width:98%;padding:10px;text-align:left;" });
      display.append($("<span/>",{style:"font-size:1.3em;text-decoration:underline;"}).html(article.title));
      display.append($("<span/>",{style:"font-size:.8em;margin-left:20px;"}).html("<br />Posted by: " + article.author + " on " + article.news_date));
      display.append(article.entry);
      display.append("<hr />");
      n.append(display);
    }

    n.append($("<div/>",{class:"bc_nav"}))
    setBreadcrumbs();
  }

  function setBreadcrumbs() {
    var bc = $(".bc_nav");
    bc.empty();
    bc.append("Page: ");
    var pages = Math.ceil(rowcount / nLimit);
    console.log("pages: " + pages);
    for (var i = 0; i < Number(pages); i++) {
      console.log("creating page: " + i);
      var s = (i==nPage) ? "background-color:#acc6ef;" : "cursor:pointer;";
      var oc = (i==nPage) ? "" : 'setPageOffset('+Number(i+1)+')';
      bc.append($("<span/>", {
        class:"gridItem",
        style:s,
        onclick:oc
      }).html(Number(i+1)))
    }
  }
  function setPageOffset(num) {
    nOffset = (num-1) * nLimit;
    nPage = num-1;
    loadNews();
  }
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
          <div id="newsContent" style="text-align:left;"></div>

        </div>
      </div>
    </div>
  </center></main>
  <?php echo $footer; ?>
</body>
</html>
