<?php
header("Content-Type: application/json; charset=UTF-8");
require_once "../overhead.php";

$conn = new mysqli($DBservername, $DBusername, $DBpassword, $dbname);
if ($conn->connect_error) {
    die("OH NO!  Our database blowed up :(  " . $conn->connect_error);
}

date_default_timezone_set("America/Denver");  //we're setting all times to Denver for the time being
$now = date("Y-m-d");
$now = "$now";
$timestamp = date("Y-m-d H:i:s");
$timestamp = "$timestamp";


mysqli_set_charset($conn, 'utf8');

$queryType = (isset($_GET["qType"])) ? $_GET["qType"] : "default";
$o = json_decode($_POST["p"], false);
switch ($queryType) {
  //////////////////////////////////////////////////////////////////////////////MODULES/QUESTS/EVENTS
  case "get_item_hunt":
    $q = $conn->query("SELECT * FROM item_hunt") or die($conn->error);
    $qr = $q->fetch_object();

    if ($qr->items != "") {
      $i = $conn->query("SELECT id, src FROM item WHERE id IN ($qr->items)") or die($conn->error);
      $items = [];
      while($it = $i->fetch_assoc()) {
        $items[] = $it;
      }
      $qr->items = $items;
    } else {
      $qr->items = [];
    }

    if ($qr->prize_items != "") {
      $j = $conn->query("SELECT id, src FROM item WHERE id IN ($qr->prize_items)") or die($conn->error);
      $prizeItems = [];
      while($it = $j->fetch_assoc()) {
        $prizeItems[] = $it;
      }
      $qr->prize_items = $prizeItems;
    } else {
      $qr->prize_items = [];
    }

    echo json_encode($qr);
  break;

  case "update_item_find_vars":
    $v = $o->vals; //because I'm lazy at the moment...and tired.

    $conn->query("UPDATE item_hunt SET
      name = '$v->name',
      description = '$v->description',
      items = '".implode(",", $v->items)."',
      goal = $v->goal,
      prize_items = '".implode(",", $v->prize_items)."',
      trophy = $v->trophy") or die($conn->error);

    echo "success";
  break;

  case "activate_item_find":
    //TODO:build this...when you've had a real night's sleep.
  break;
  case "deactivate_item_find":
    //TODO:find a cure for insomnia...
    //this file...is starting to become a little unwieldy...
  break;

  case "get_quest_progress":
    $r = $conn->query("SELECT * FROM quest_tracking WHERE type = '$o->type' AND pid = $o->pid") or die($conn->error);
    if ($r->num_rows == 0) {
      $conn->query("INSERT INTO quest_tracking (type, pid) VALUES('$o->type', $o->pid)") or die($conn->error);
      echo 0;
    } else {
      $count = $r->fetch_object()->count;
      echo $count;
    }

  break;

  case "add_quest_count":
    $conn->query("UPDATE quest_tracking SET count = count + 1 WHERE type = '$o->type' AND pid = $o->pid") or die($conn->error);
    echo "success";
  break;

  case "reset_quest_tracking":
    $conn->query("DELETE FROM quest_tracking WHERE type = '$o->type'") or die($conn->error);
    echo "success";
  break;
  case 'change_if_status':
    //get the current String
    $cs = $conn->query("SELECT active_mods FROM siteoptions")->fetch_object()->active_mods;
    $modList = explode(",", $cs);
    if (array_search('0', $modList) > -1) array_splice($modList, array_search('0', $modList), 1);  //kill the blank default if it exists
    if (array_search('', $modList) > -1) array_splice($modList, array_search('', $modList), 1);  //kill the blank default if it exists
    if ($o->activate == 1) {
      if (array_search($o->module, $modList) == -1 || count($modList) == 0) $modList[] = $o->module;
    } else {
      if (array_search($o->module, $modList) > -1) {
        array_splice($modList, array_search($o->module, $modList), 1);
      }
      if (count($modList) == 0) $modList[] = '0';
    }
    $modString = implode(',', $modList);
    $conn->query("UPDATE siteoptions SET active_mods = '$modString'") or die($conn->error);
    // echo json_encode($modList);
    echo 'success';


  break;

  default:

  break;
}


?>
