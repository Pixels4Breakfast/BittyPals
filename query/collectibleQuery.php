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


$o = json_decode($_POST["p"], false); $touchDB = false;  $override = true;

$queryType = (isset($_GET["qType"])) ? $_GET["qType"] : "default";
switch ($queryType) {
  case "get_collectibles":
    if (!isset($_SESSION['active_collection'])) {
      echo "fail 1";
    } else {
      if ($_SESSION['active_collection'] == 0) {
        echo "No active collection";
        die();
      }
      $cr = $conn->query("SELECT * FROM collection WHERE id = $_SESSION[active_collection]") or die($conn->error);

      if ($cr->num_rows > 0) {
        $collection = $cr->fetch_object();
        $items = [];

        $ir = $conn->query("SELECT name, id, src, description FROM item WHERE id IN ($collection->items)") or die($conn->error);
        while($item = $ir->fetch_object()) {
          $items[] = $item;
        }
        $collection->items = $items;

        echo json_encode($collection);
      } else {
        echo "fail 2";
      }
    }

    // $sql = "SELECT name, id, src, description FROM item WHERE id IN (106,107,108,109)";
  break;
  case "validate_collection":
    //TODO: figure out why this isn't working...
    //get the list that they need
    $cr = $conn->query("SELECT items FROM collection WHERE id = $o->cid") or die($conn->error);
    $master = [];
    $c = "";
    if ($cr->num_rows > 0) {
      while($iList = $cr->fetch_object()) {
        $c = $iList->items;
        $master = explode(",", $iList->items);  //this is a dumbass way to do this...
      }
    }

    $vf = false;  //verification flag (exit clause)
    //get distinct from their inventory
    $pr = $conn->query("SELECT DISTINCT item_id FROM inventory WHERE pid = $o->pid AND item_id IN ($c)") or die($conn->error);
    $pa = [];
    while ($i = $pr->fetch_object()) {
      $pa[] = $i->item_id;
    }
    if (count($pa) == count($master)) {
      echo "verified";
      $vf = true;
    } else {
      // echo "unverified";
    }

    if (!$vf) {
      //check their gift box (because we just sent them the damn thing, so it won't be in their inventory yet...)
      $gr = $conn->query("SELECT item_list FROM gift WHERE rid = $o->pid AND sid = 0 ORDER BY id DESC LIMIT 1") or die($conn->error);
      $ga = [];
      while ($j = $gr->fetch_object()) {
        $ga = array_unique($pa + explode(',', $j->item_list));
      }
      if (count($master) == count($ga)) {
        echo "verified";
      } else {
        echo "unverified";
      }
    }



  break;


  case 'activate_collection':
    $conn->query("UPDATE siteoptions SET active_collection = $o->id") or die($conn->error);
    echo 'success';
  break;
  case 'delete_collection':
    if (isset($_SESSION['active_collection'])) if ($_SESSION['active_collection'] == $o->id) $conn->query("UPDATE siteoptions SET active_collection = 0") or die($conn->error);
    $conn->query("DELETE FROM collection WHERE id = $o->id") or die($conn->error);
    echo 'success';
  break;
  case 'fetch_collection':
    $r = $conn->query("SELECT * FROM collection WHERE id = $o->id") or die($conn->error);
    $c = $r->fetch_object();
    $cItems = [];
    $cList = explode(",", $c->items);
    $iCount = count($cList);
    for ($i=0; $i<$iCount; $i++) {
      $ir = $conn->query("SELECT id, name, src FROM item WHERE id = $cList[$i]") or die($conn->error);
      $cItems[] = $ir->fetch_object();
    }
    $c->items = $cItems;
    $tr = $conn->query("SELECT id, name, src FROM trophy WHERE id = $c->trophy") or die($conn->error);
    $c->trophy = $tr->fetch_object();
    echo json_encode($c);
  break;
  case 'save_collection':
    if($o->id == 0) {
      $conn->query("INSERT INTO collection (title, short_description, long_description, items, base_price, trophy)
                    VALUES ('$o->title', '$o->short_description', '$o->long_description', '$o->items', $o->base_price, $o->trophy)
                    ") or die($conn->error);
    } else {
      $conn->query("UPDATE collection SET
                    title = '$o->title',
                    short_description = '$o->short_description',
                    long_description = '$o->long_description',
                    items = '$o->items',
                    base_price = $o->base_price,
                    trophy = $o->trophy
                    WHERE id = $o->id
                    ") or die($conn->error);
    }
    echo 'success';
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
