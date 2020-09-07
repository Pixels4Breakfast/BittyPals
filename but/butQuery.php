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

date_default_timezone_set("America/Denver");  //we're setting all times to Denver for the time being
$now = date("Y-m-d");
$now = "$now";
$timestamp = date("Y-m-d H:i:s");
$timestamp = "$timestamp";

$override = true;
$touchDB = false;

$queryType = (isset($_GET["qType"])) ? $_GET["qType"] : "default";
$o = json_decode($_POST["p"], false);
switch ($queryType) {
  case "do_something":

  break;

  default:
    echo "Holy broken query strings, Batman!<br />$queryType";
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
