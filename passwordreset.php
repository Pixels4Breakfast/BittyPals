<!-- $to = "somebody@example.com";
$subject = "My subject";
$txt = "Hello world!";
$headers = "From: webmaster@example.com" . "\r\n" .
"CC: somebodyelse@example.com";

mail($to,$subject,$txt,$headers); -->



<?php
  require_once "overhead.php";

  // if (isset($_SESSION['player_id'])) header("Location:habitat");

  $pageAction = "default";
  $errorMessage = "";
  $verified = false;
  $saved = false;
  $formContent = "";
  if (isset($_GET['action'])) {
    $pageAction = $_GET['action'];
    switch($_GET['action']) {
      case "getform":
        if (!isset($_POST['email'])) {

        } else {
          $conn = new mysqli($DBservername, $DBusername, $DBpassword, $dbname); if ($conn->connect_error) { die("OH NO!  Our database blowed up :(  " . $conn->connect_error); }
          $sql = "SELECT player.secret_question, secret_questions.question, secret_questions.id FROM player INNER JOIN secret_questions ON player.secret_question = secret_questions.id WHERE LOWER(player.email) = LOWER('$_POST[email]')";
          $r = $conn->query($sql) or die($conn->error);

          if ($r->num_rows == 1) {
            $ps = $r->fetch_object();
            $formContent = $ps->question.' <input type="text" name="answer" /><input type="hidden" name="qid" value="'.$ps->id.'" /><input type="hidden" name="email" value="'.$_POST['email'].'" />';
          } else {
            $errorMessage = "<br />We couldn't find an account with that email address.<br />Please make sure you've spelled it right<br />If you did not set a secret question and answer, you will not be able to reset your password while we're in Beta.<br />Let Dusty know, and we'll get it taken care of for you.";
          }
          $conn->close();
        }
      break;
      case "verify":
        $conn = new mysqli($DBservername, $DBusername, $DBpassword, $dbname); if ($conn->connect_error) { die("OH NO!  Our database blowed up :(  " . $conn->connect_error); }
        $r = $conn->query("SELECT id, username FROM player WHERE secret_question = $_POST[qid] AND LOWER(email) = LOWER('$_POST[email]') AND LOWER(secret_answer) = LOWER('$_POST[answer]')") or die($conn->error);
        if ($r->num_rows == 1) {
          $verified = true;
          $p = $r->fetch_object();
          $formContent = 'Hello, '.$p->username.'!<br />Enter your new password below<br />'
          .   '<input type="password" name="password" /><input type="hidden" name="pid" value="'.$p->id.'" />';
        } else {
          $errorMessage = "We're having trouble finding your account.<br />Please make sure you've spelled your answer right";
        }
        $conn->close();
      break;
      case "save":
        if ($_POST['password'] != "") {
          $conn = new mysqli($DBservername, $DBusername, $DBpassword, $dbname); if ($conn->connect_error) { die("OH NO!  Our database blowed up :(  " . $conn->connect_error); }
          $conn->query("UPDATE player SET password = PASSWORD('$_POST[password]') WHERE id = $_POST[pid]") or die($conn->error);
          $saved = true;
        } else {
          $errorMessage = "Whoops!  Looks like you forget to enter a new password.<br />You'll have to <a href=\"passwordreset.php\">go back</a> and try again.<br />Sorry :/";
        }
      break;
      default:
        $pageAction = "default";
      break;
    }
  }

?>
<!DOCTYPE html>

<html>
<head>
<title>Password Reset</title>
<?php echo $requiredHead; ?>

<script>
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
            <h1>Password Reset Request</h1>
            This is a very simple on-site password reset for the duration of the Beta test.  After that, password resets will be sent to the email address you provided on registration.


            <?php if ($pageAction == "default") : ?>
              <br /><br /><br />
              <div style="text-align:left;">
                <form action="passwordreset.php?action=getform" method="post">
                  Email Address: <input type="text" name="email" /><br />
                  <input type="submit" value="Submit" />
                </form>
              </div>

            <?php endif; if ($pageAction == "getform") : ?>
              <?php
                if ($errorMessage != "") {
                  echo '<span style="color:red;">'.$errorMessage.'</span><br />';
                  echo '<br /><br /><br />'
                    .'<div style="text-align:left;">'
                    .'  <form action="passwordreset.php?action=getform" method="post">'
                    .'    Email Address: <input type="text" name="email" /><br />'
                    .'    <input type="submit" value="Submit" />'
                    .'  </form>'
                    .'</div>';
                } else {
                  echo '<br /><br /><br /><form action="passwordreset.php?action=verify" method="post">'.$formContent.'<br /><input type="submit" value="Submit" /></form>';
                }
              ?>

            <?php endif; if ($pageAction == "verify") : ?>
              <?php
                if ($verified) {
                  echo '<br /><br /><br /><form action="passwordreset.php?action=save" method="post">'.$formContent.'<br /><input type="submit" value="Submit" /></form>';
                } else if ($errorMessage != "") {
                  echo '<br /><br /><br />'.$errorMessage;
                }
              ?>

            <?php endif; if ($pageAction == 'save') : ?>
              <?php
                if ($saved) {
                  echo '<br /><br /><br />Congratulations!  Your password has been changed.<br />You can go back to the <a href="home">Homepage</a> to log in.';
                } else {
                  //do what?
                }
              ?>
            <?php endif; ?>

        </div>
      </div>
    </div>
  </center></main>
  <?php echo $footer; ?>
</body>
</html>
