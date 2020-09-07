
<?php
  require_once "overhead.php";

  // if (isset($_SESSION['player_id'])) header("Location:habitat");

  $page = ""; $username = "Casper"; $playerID = 0;
  if (isset($_GET['page'])) $page = $_GET["page"];
  if (isset($_SESSION['player_username'])) $username = $_SESSION['player_username'];
  if (isset($_SESSION['player_id'])) $playerID = $_SESSION['player_id'];
?>
<!DOCTYPE html>

<html>
<head>
<title>Terraformers</title>
<?php echo $requiredHead; ?>

<script>
  var playerID = <?php echo $playerID; ?>;
  $('document').ready(function() {

  })
</script>
<style>

</style>

</head>
<body class="site">
<?php echo $alertPanes; ?>

  <main class="site_content"><center>
    <div id="gameFrame" class="game_frame content">

      <div id="header" class="header">
        <div id="logoPane" class="site_logo"></div>
        <!-- <div id="headBar" class="head_bar"></div> -->
      </div>
      <!-- <div style="z-index:100; position:relative;"><img src="assets/site/logo.png" /></div> -->
      <div class="static_content" style="margin-top:-80px; z-index:2; overflow:visible; height:650px;">
        <div class="landing_lower" style="display:inline-block; position:relative; height:auto;">
            <h1>Welcome, Terraformers!</h1>
            <h2>(please take a minute to read this)</h2>
              Whew!  It's been a whirlwind of development, and you guys are the first ones who get to see it.  We're not done, by any means, so there are some things that you need to know for the Beta.
              <br />
              We have one developer, who is also the primary artist, so he's had to divvy up his time between making BittyPals functional, and making it pretty.  Functional took the bigger piece of that cake, so there's a lot on the site that isn't nearly as refined as it will be in a few weeks.  Don't worry.  It'll get better ;)
              <br />
              That also means that there aren't a lot of items in the marketplace yet, but we're getting to those as fast as we can.  What we need from you right now, is feedback on things that don't work in the game.  Once you've adopted a Pal, we'd appreciate it if you'd head on over to the Community forum and register there, too.  Please feel free to post comments and ask questions on the forum.  If you find a bug, please check the Technobabble forum on the Community page to see if we already know about it.  If we do, we're already working on fixing it.  If we don't, let us know, so that we can squash it ;)
              <br />
              Eventually, we'll be linking the forum tighter with the rest of the site so that logging into BittyPals will automatically log you in to the forum, but that's going to be a little ways down the road.  The forum isn't pretty (at all) right now, but that's another thing on our list to take care of before we move out of the Beta phase next month.  Bear with us.
              <br />
              <br />
              HotFixes will be going in at a rapid pace, so if something suddenly changes, don't freak out :)  If something breaks, you might just need to refresh your cache (hold down Shift and refresh the page).  If the bug is still there, check to see if we know about it, and report it if needed.
              <br />
              <br />
              New items will be showing up in the marketplace as the artist/codemonkey has a few minutes here and there to whip up new ones, so check back often!
              <br />
              <br />
              <br />
            <div class="blue_button" style="padding:10px; border-radius:10px; position:relative;cursor:pointer; vertical-align:middle;" onclick="window.location='adoption';">
              Yeah yeah, lemme play with stuff, already! :)
            </div>

        </div>
      </div>
    </div>
  </center></main>
  <?php echo $footer; ?>
</body>
</html>
