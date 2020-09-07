<?php
require_once "overhead.php";

if (isset($_SESSION['player_id'])) header("Location:habitat");
$override = '<div style="position:absolute; top:0px; left:0px; height:20px; width:20px; cursor:pointer;" onclick="overrideLogin();"></div>';
?>
<!DOCTYPE html>

<html>
<head>
<title>Welcome to BittyPals!</title>
<?php echo $requiredHead; ?>

<script>
  var playlist = [
    {src:"assets/sound/track/OrmyrsTune.mp3", title:"Dozing in the Sun", album:"Ormyr's Daydreams"}
  ]
  var playing = false;
  var mute = false;
  var theme = undefined;
  var track = undefined;

  $(document).ready(function() {
    $("#i_username").on('keypress', function(e) { if (e.keyCode == 13) { login(); }});
    $("#i_password").on('keypress', function(e) { if (e.keyCode == 13) { login(); }});
    $("#i_username").focus();

    // $(document).on('click', function(e) { playTheme() });

  })

  function playTheme(fromKey) {
    if (playing && fromKey) return;
    if (theme != undefined) theme.stop();
    track = playlist[Math.floor(Math.random() * playlist.length)];
    theme = new Sound(track.src);

    theme.loop();
    theme.autoplay();

    playing = true;
    popNotify(`<span style="font-size:.6em;">Now playing:</span><br />${track.title}<br /><span style="font-size:.6em;">from</span><br />${track.album}<br /><span style="font-size:.6em;">&copy;2018 MythPlaced Treasures, LLC</span>`);
  }
</script>

</head>
<body class="site">
<?php echo $alertPanes; ?>
<!--Kill this when live-->
<!-- <div style="position:absolute;">
<input type="text" style="border:none; width:150px; background-color:rgba(0,0,0,0)" id="i_username" placeholder="" /><br />
<input type="password" style="border:none; width:150px; background-color:rgba(0,0,0,0)" id="i_password" placeholder="" /><br />
</div> -->
<!--end suicidal login-->

  <main class="site_content"><center>

    <noscript>
      <div class="mask"></div>
      <div class="profile_pane">
        This site requires JavaScript.<br />
        Please <a href="http://www.enable-javascript.com/">enable JavaScript</a> in your browser to continue.
      </div>
    </noscript>

    <?php //echo $override; ?>

    <div id="gameFrame" class="game_frame content">
      <div id="gameNotification" style="font-size:1.3em; top:300px;z-index:20000;<?php echo $mnDisplay; ?>"><?php echo $maintenanceNotification; ?></div>
      <div class="static_content" style="margin-top:0px; z-index:2; overflow:visible; height:550px;">
        <div class="landing_backer"></div>
        <div class="landing_lower">

          <div class="landing_left" style="width:70%">
            <div style="">
              BittyPals live in a BittyVerse that exists on the other side of your screen. They are smart little creatures who thrive best when partnered with a Human Companion. <br />Please adopt a little BittyPal to love, and help them grow and learn. Together, you can explore the BittyVerse and meet other BittyPals and make friends with their Human Companions.
            </div>
            <br />
            <div class="blue_button" style="padding:10px; border-radius:10px; position:relative;cursor:pointer; vertical-align:middle;" onclick="window.location='adoption';">
              Adopt a pal today!
            </div>
            <a link="#" onclick="playTheme(true)" style="font-weight:bold; font-size:1.1em; color:blue; user-select:none; cursor:pointer;">To hear something special, click here!</a>



          </div>
          <div class="landing_right" style="width:30%;">
            <!-- KILL THIS -->
            <!-- <span style="color:red; font-weight:bold;">Due to technical issues, Bitty-Pals will be offline temporarily.  We'll be back soon.</span> -->

            Already have a BittyPal?<br />
            <input type="text" style="border-radius:5px; font-size:1.4em; text-align:center;" id="i_username" placeholder="Username" /><br />
            <input type="password" style="border-radius:5px; font-size:1.4em; text-align:center;" id="i_password" placeholder="Password" /><br />
            <div class="blue_button" style="cursor:pointer; border-radius:5px; width:250px; font-size:1.4em; padding:4px; margin-top:5px;" onclick="login();">Play!</div>
            <br />
            <div style="font-size:.8em;"><a href="passwordreset.php">Forget Your Password?</a></div>

          </div>
        </div>
      </div>
    </div>
  </main>
  <?php echo $footer; ?>
</body>
</html>
