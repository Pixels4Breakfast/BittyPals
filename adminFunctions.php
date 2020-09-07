<?php
require_once "overhead.php";


if (isset($_GET['action'])) {
  switch ($_GET['action']) {
    case "imageUpload":
      //do something cool...
      //we're going to do a naughty, and assume that we processed the image path correctly...
      $target = $_GET["imageTarget"];
      if(isset($_FILES["file"]["type"])) {
        $validextensions = array("jpeg", "jpg", "png", "gif");
        $temporary = explode(".", $_FILES["file"]["name"]);
        $file_extension = end($temporary);
        if ((($_FILES["file"]["type"] == "image/png") || ($_FILES["file"]["type"] == "image/jpg") || ($_FILES["file"]["type"] == "image/jpeg") || ($_FILES["file"]["type"] == "image/gif")
                ) && ($_FILES["file"]["size"] < 1000000 )  //scary high file size...
                && in_array($file_extension, $validextensions)) {
          if ($_FILES["file"]["error"] > 0) {
            echo "Return Code: " . $_FILES["file"]["error"] . "<br/><br/>";
          } else {
            if (file_exists($target)) {
              echo $target . " <span id='invalid'><b>already exists.</b></span> ";
            } else {
              $sourcePath = $_FILES['file']['tmp_name']; // Storing source path of the file in a variable
              // $targetPath = "upload/".$_FILES['file']['name']; // Target path where file is to be stored
              $targetPath = $target;  //...redundant...
              move_uploaded_file($sourcePath, $targetPath) ; // Moving Uploaded file
              if ($_GET['type'] == 'bg') {
                $conn = new mysqli($DBservername, $DBusername, $DBpassword, $dbname);
                if ($conn->connect_error) { die("OH NO!  Our database blowed up :(  " . $conn->connect_error); }
                $conn->query("UPDATE siteoptions SET background = '".$_FILES["file"]["name"]."'") or die($conn->error);
                echo '<script>window.history.back();</script>';
              }
              echo "success";
            }
          }
        } else {
          if ($_FILES['file']['size'] == 0) {
            echo 'success';
          } else {
            echo "<span id='invalid'>***Invalid file Size or Type***<span>";
          }
        }
      }
    break;
    case "newsEntry":
      print_r($_POST);
      $author = (isset($_POST['author'])) ? $_POST['author'] : "BittyPals";
      $title = (isset($_POST['title'])) ? $_POST['title'] : "No Title";
      $entry = addslashes($_POST['entry']);  //if this is blank, we're going to have an issue...

      $conn = new mysqli($DBservername, $DBusername, $DBpassword, $dbname);
      if ($conn->connect_error) { die("OH NO!  Our database blowed up :(  " . $conn->connect_error); }

      if ($_POST['id'] == 0) {
        $sql = "INSERT INTO news (author, title, entry, news_date) VALUES ('$author', '$title', '$entry', CURRENT_TIMESTAMP)";
      } else {
          $sql = "UPDATE news SET author = '$author', title = '$title', entry = '$entry' WHERE id = $_POST[id]";
      }
      $conn->query($sql) or die($conn->error);

      $conn->close();
      header("Location: admin?page=news");
    break;
    case "savefaq":
      $fid = $_POST['fid'];
      $question = $_POST['question'];
      $answer = $_POST['answer'];
      if ($id == 'new') {
        $sql = "INSERT INTO faq (question, answer) VALUES ('".addslashes($question)."', '".addslashes($answer)."')";
      } else {
        $sql = "UPDATE faq SET question = '".addslashes($question)."', answer = '".addslashes($answer)."' WHERE id = $fid";
      }
      // echo $sql;
      $conn = new mysqli($DBservername, $DBusername, $DBpassword, $dbname);
      if ($conn->connect_error) { die("OH NO!  Our database blowed up :(  " . $conn->connect_error); }
      $conn->query($sql) or die("QUERY: ".$sql."<br />".$conn->error);
      $conn->close();
      header("Location: admin?page=faq");
    break;
    case 'parallax_upload':
      $target = "assets/parallax/";
      //TODO: make the base directory a passed variable
      move_uploaded_file($_FILES["upload_image"]["tmp_name"],$target.$_FILES["upload_image"]["name"]);
    break;

    default:
      echo "no action sent to adminFunctions";
    break;
  }
}
?>
