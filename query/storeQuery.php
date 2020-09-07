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
  case "get_store":
    $sis = [];
    $sr = $conn->query("SELECT * FROM store_item WHERE active = 1 ORDER BY special DESC, date_created DESC") or die($conn->error);
    while ($si = $sr->fetch_object()) {
      $items = [];
      //get the src and title from the items list.  Going to have to do something about sprites...
      // $itemList = explode(",",$si->items);
      foreach(explode(",", $si->items) as $k => $v) {
        $i = explode(":", $v);
        $item = new stdClass();
        $item->id = $i[0];
        $item->count = $i[1];
        $ir = $conn->query("SELECT name, src, preview, is_sprite, frame_width, frame_height, frame_count FROM item WHERE id = $item->id") or die("Failed item lookup $item->id\n".$conn->error);
        $res = $ir->fetch_object();

        foreach($res as $k => $v) $item->$k = $v;
        $items[] = $item;
      }
      $si->items = $items;
      $sis[] = $si;

    }
    echo json_encode($sis);

  break;

  case 'commit_serial_transaction':
    // $s = serialize($sis);
    // echo json_encode(unserialize($s));
    //going to create a data record of the transaction
    $cart = implode(",", $o->cart->items);
    $gold = $o->cart->gold;
    $conn->query("INSERT INTO t_serial (pid, invoice, usd, gold, cart, verified) VALUES (
      $o->pid,
      '$o->invoice',
      $o->usd,
      $gold,
      '$cart',
      0)") or die($conn->error);
    echo 'success';
  break;

  case 'verify_serial_transaction':
    $conn->query("UPDATE t_serial SET verified = 1, gid = $o->gid WHERE invoice = '$o->invoice'") or die($conn->error);
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
