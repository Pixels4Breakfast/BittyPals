<?php
header("Content-Type: application/json; charset=UTF-8");
require_once "../overhead.php";

$conn = new mysqli($DBservername, $DBusername, $DBpassword, $dbname);
if ($conn->connect_error) {
    die("OH NO!  Our database blowed up :(  " . $conn->connect_error);
}

$touchDB = true;
$override = false;
$responseFlag = false;
$calcRows = false;
$sql = "";



$queryType = (isset($_GET["qType"])) ? $_GET["qType"] : "default";
switch ($queryType) {
  case "spent_gold":
    $o = json_decode($_POST["p"], false); $touchDB = false;  $override = true;
    $conn->query("UPDATE player SET gold_spent_in_arcade = gold_spent_in_arcade + $o->amount WHERE id = $o->pid") or die($conn->error);
    echo "success";
  break;
  case "won_gold":
    $o = json_decode($_POST["p"], false); $touchDB = false;  $override = true;
    $conn->query("UPDATE player SET gold_won_in_arcade = gold_won_in_arcade + $o->amount WHERE id = $o->pid") or die($conn->error);
    echo "success";
  break;
  case "bar":
    $o = json_decode($_POST["p"], false); $touchDB = false;  $override = true;


  break;
  default:
    echo "Holy broken query strings, Batman!";
  break;

}




                                                                                //RETURN
if($touchDB) {
  $result = $conn->query($sql) or die($sql."\n".$conn->error);
  if ($responseFlag) {
    echo "success";
  } else { //looking for a full return
    // echo $sql;
    if (isset($result->num_rows)) {
      if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
      }

      // echo json_encode($outp);
      echo json_encode($data);
    } else {
      echo 'success';
    }
  }
  $conn->close();
} else {
  if (!$override) echo $sql;
  @$conn->close();
}

?>
