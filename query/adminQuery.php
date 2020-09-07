<?php
header("Content-Type: application/json; charset=UTF-8");
require_once "../overhead.php";

$conn = new mysqli($DBservername, $DBusername, $DBpassword, $dbname);
if ($conn->connect_error) {
    die("OH NO!  Our database blowed up :(  " . $conn->connect_error);
}

$touchDB = false;
$override = true;
$responseFlag = false;
$calcRows = false;
$sql = "";

date_default_timezone_set("America/Denver");  //we're setting all times to Denver for the time being
$now = date("Y-m-d");
$now = "$now";
$timestamp = date("Y-m-d H:i:s");
$timestamp = "$timestamp";


// function resetPlot($thisPlotID) {
//   global $conn;
//   $conn->query("UPDATE garden_plot SET
//         seed_id = 0,
//         plant_id = 0,
//         stage = 0,
//         stage_increment = 12.00,
//         planted_date = '0000-00-00 00:00:00',
//         next_stage = '0000-00-00 00:00:00',
//         last_watered = '0000-00-00 00:00:00',
//         withered = 0,
//         planter_id = 0,
//         harvest_ready = 0,
//         fertilizer = 0,
//         mutated = 0
//         WHERE id = $thisPlotID
//         ") or die($conn->error);
// }



$queryType = (isset($_GET["qType"])) ? $_GET["qType"] : "default";
$o = json_decode($_POST["p"], false);

switch ($queryType) {
  case "get_list_items":
    //should take the full string and return it so that it can be used directly
    if ($o->list == "") return;
    $list = explode(",", $o->list);
    for ($i=0; $i<count($list); $i++) {
      $boom = explode(":",$list[$i]);
      $id = $boom[0];
      $count = $boom[1];
      $r = $conn->query("SELECT name FROM item WHERE id = $id") or die($conn->error);
      $name = $r->fetch_object()->name;
      $item = new stdClass();
      $item->id = $id;
      $item->count = $count;
      $item->name = $name;
      $list[$i] = $item;
    }
    echo json_encode($list);

  break;
  case "search_items":
    $res = [];
    $r = $conn->query("SELECT name, id FROM item WHERE name LIKE '%$o->string%' ORDER BY name ASC LIMIT 20") or die($conn->error);
    if ($r->num_rows > 0) {
      while($i = $r->fetch_object()) $res[] = $i;
    }
    $return = new stdClass();
    $return->type = 'item';
    $return->results = $res;
    echo json_encode($return);
  break;
  case "s_search_players":
    $res = [];
    $r = $conn->query("SELECT username AS name, id FROM player WHERE username LIKE '%$o->string%' OR id = '$o->string' ORDER BY username ASC LIMIT 20") or die($conn->error);
    if ($r->num_rows > 0) {
      while($i = $r->fetch_object()) $res[] = $i;
    }
    $return = new stdClass();
    $return->type = 'player';
    $return->results = $res;
    echo json_encode($return);
  break;
  case 'search_player':
    $string = $o->string;
    $r = $conn->query("SELECT SQL_CALC_FOUND_ROWS
                      id, username, email, join_date, last_login, ip
                      FROM player WHERE id = '$string' OR username LIKE '%$string%' OR email LIKE '%$string%' ORDER BY id LIMIT $o->limit OFFSET $o->offset") or die($conn->error);

    $ob = new stdClass();
    $ob->offset = $o->offset;
    $ob->players = [];
    if ($r->num_rows > 0) {
      while($p = $r->fetch_object()) $ob->players[] = $p;
    }
    $rcr = $conn->query("SELECT FOUND_ROWS() AS rowcount") or die($conn->error);
    $ob->rowcount = $rcr->fetch_object()->rowcount;
    echo json_encode($ob);
  break;

  //////////////////////////////////////////////////////////////////////////////WIDGETS
  case "insert_widget":
    //nice and simple
    $data = serialize($o->data);
    $conn->query("INSERT INTO widget (type, data) VALUES ('$o->type', '$data')") or die($conn->error);
    //get the insert id and return it
    $wid = $conn->insert_id;
    $r = new stdClass();
    $r->wid = $wid;
    echo json_encode($r);
  break;

  case "fetch_widget_list":
    $wl = $conn->query("SELECT * FROM widget ORDER BY type ASC") or die($conn->error);  //maybe filter out ClickAnimate for now?
    $widgets = [];
    while($w = $wl->fetch_object()) {
      $w->data = preg_replace('!s:(\d+):"(.*?)";!e', "'s:'.strlen('$2').':\"$2\";'", $w->data);
      $w->data = unserialize($w->data);
      $widgets[] = $w;
    }
    echo json_encode($widgets);
  break;
  case "update_widget":

  break;


  //////////////////////////////////////////////////////////////////////////////END WIDGETS
  case 'delete_trophy':
    $tr = $conn->query("SELECT src FROM trophy WHERE id = $o->id") or die($conn->error);
    $trophy = $tr->fetch_object();
    //remove all inventory items
    $conn->query("DELETE FROM trophies WHERE tid = $o->id") or die($conn->error);
    $conn->query("DELETE FROM trophy WHERE id = $o->id") or die($conn->error);
    if (!unlink($trophy->src)) {
      echo "ERROR: could not unlink file.  Database records successfully deleted.";
    } else {
      echo "success";
    }
  break;

  case 'fetch_spinner_items':
    $r = new stdClass();
    $si = $conn->query("SELECT * FROM spinner_prizes ORDER BY id ASC") or die($conn->error);
    $sb = $conn->query("SELECT spinner_cost, spinner_background FROM siteoptions") or die($conn->error);

    $sbr = $sb->fetch_object();
    $r->spinnerBackground = $sbr->spinner_background;
    $r->spinnerCost = $sbr->spinner_cost;

    $r->si = [];
    while ($sItem = $si->fetch_object()) $r->si[] = $sItem;

    echo json_encode($r);
  break;
  case 'get_item_name':
    $iq = $conn->query("SELECT name FROM item WHERE id = $o->id") or die($conn->error);
    echo $iq->fetch_object()->name;
  break;
  case 'spinner_search':
    $r = $conn->query("SELECT id, name, src FROM item WHERE name LIKE '%$o->string%' AND type != 'pet' LIMIT 50") or die($conn->error);
    $results = [];
    while ($i = $r->fetch_object()) $results[] = $i;
    echo json_encode($results);
  break;
  case 'save_spinner_prizes':
    $sql = "";
    foreach($o->prizes as $k=>$v) {
      $conn->query("UPDATE spinner_prizes SET title = '$v->title', description = '$v->description', img = '$v->img', type = '$v->type', value = '$v->value' WHERE id = $v->id") or die($conn->error);
    }
    echo 'success';
  break;

  case 'fetch_transaction_history':
    $q = "SELECT SQL_CALC_FOUND_ROWS h.*, p.username, p.email FROM transaction_history h INNER JOIN player p ON h.pid = p.id WHERE h.id > 0";

    //poly for quicksums
    if (isset($o->quickSum)) {
      $q = "SELECT sum(h.amount) AS sum FROM transaction_history h WHERE id > 0";
    }

    if (isset($o->type)) $q .= " AND h.type = '$o->type'";
    if (isset($o->pid)) $q .= " AND h.pid = $o->pid";
    //date range
    if (isset($o->dateMin)) $q .= " AND h.date >= '$o->dateMin'";
    if (isset($o->dateMax)) $q .= " AND h.date <= '$o->dateMax'";


    if (!isset($o->quickSum)) $q .= " ORDER BY $o->order $o->dir LIMIT $o->limit OFFSET $o->offset";


    $ret = new stdClass();
    $r = $conn->query($q) or die($conn->error);
    if (isset($o->quickSum)) {
      $ret->sum = $r->fetch_object()->sum;
      $ret->params = $o;
    } else {
      $records = [];
      while($rec = $r->fetch_object()) $records[] = $rec;

      $fr = $conn->query("SELECT FOUND_ROWS() as rowcount") or die($conn->error);

      $ret->records = $records;
      $ret->rowcount = $fr->fetch_object()->rowcount;
    }
    echo json_encode($ret);
  break;
  case 'fetch_transaction_details':
    if (!isset($o->invoice)) {
      echo "ERROR::No Invoice Sent";
      die();
    } else {
      //do something...
      $rob = new stdClass();
      $r = $conn->query("SELECT * FROM t_serial WHERE invoice = '$o->invoice'") or die(__LINE__.$conn->error);
      if ($r->num_rows == 0) {
        echo "No serial record found for transaction $o->invoice"; die();
      } else {
        $serial = $r->fetch_object();
        $rob->serial = $serial;
        if ($serial->gid == 0) {
          $rob->gift = "<br />No attached gift record (this will always be empty for Gold, Monthly, Donation, and Collectible transactions)";
        } else {
          $g = $conn->query("SELECT * FROM gift WHERE id = $serial->gid") or die($conn->error);
          if ($g->num_rows == 0) {
            $rob->gift = "No matching gift record found for transaction $o->invoice and Gift ID $serial->gid";
          } else {
            $rob->gift = $g->fetch_object();
          }
        }
      }
      $rob->date = $o->date;
      $rob->type = $o->type;
      $rob->username = $o->username;
      echo json_encode($rob);
    }
  break;
  case 'get_item_names':
    $r = $conn->query("SELECT id, name FROM item WHERE id IN($o->list)") or die($conn->error);
    $ret = [];
    while($i = $r->fetch_object()) $ret[] = $i;
    echo json_encode($ret);
  break;


  case 'get_monthly_info':
    $data = new stdClass();
    $si = $conn->query("SELECT s.monthly_item, s.monthly_src, t.id, t.name
                        FROM siteoptions s
                        INNER JOIN trophy t
                        ON SUBSTRING_INDEX(t.src, '/', -1) = SUBSTRING_INDEX(s.monthly_src, '/', -1)")
                          or die($conn->error);
    $sir = $si->fetch_object();

    $data->monthly_item = $sir->monthly_item;
    $data->monthly_src = $sir->monthly_src;
    $data->name = $sir->name;
    $data->tid = $sir->id;

    $data->item = new stdClass();

    //get the trophy list
    $tl = $conn->query("SELECT name, src, id FROM trophy WHERE name LIKE '%supporter%'") or die($conn->error);
    $trophies = [];
    while ($t = $tl->fetch_object()) $trophies[] = $t;
    $data->trophies = $trophies;

    //get the badge list
    $bl = $conn->query("SELECT name, id, src FROM item WHERE name LIKE '%supporter%'") or die($conn->error);
    $items = [];
    while($b = $bl->fetch_object()) {
      $items[] = $b;
      if ($b->id == $sir->monthly_item) $data->item = $b;
    }
    $data->items = $items;



    echo json_encode($data);
  break;
  case 'save_monthly_info':
    $id = $o->id;//ph
    $src = $o->src;//ph
    $conn->query("UPDATE siteoptions SET monthly_src = '$src', monthly_item = $id") or die($conn->error);
    echo 'success';
  break;

  case 'activate_maintenance':
    $r = new stdClass();
    $conn->query("UPDATE siteoptions SET maintenance = 1, maint_start = '$o->start', maint_end = '$o->end'") or die($conn->error);
    $r->status = 'success';
    $r->type = 'activate';
    echo json_encode($r);
  break;
  case 'deactivate_maintenance':
    $conn->query("UPDATE siteoptions SET maintenance = 0, maint_start = '00/00/0000', maint_end = '00/00/0000'") or die($conn->error);
    $r = new stdClass();

    $r->status = 'success';
    $r->type = 'deactivate';
    echo json_encode($r);
  break;
  case 'get_site_bg':
    $bg = $conn->query("SELECT background FROM siteoptions") or die($conn->error);
    echo $bg->fetch_object()->background;
  break;
  case 'set_site_bg':
    $conn->query("UPDATE siteoptions SET background = '$o->background'") or die($conn->error);
    echo 'success';
  break;





  default:
    echo "Holy broken g-strings, Batman!<br />$queryType";
  break;

}




                                                                                //RETURN
if($touchDB) {
  $data = [];
  $result = $conn->query($sql) or die($sql."\n".$conn->error);
  if ($responseFlag) {
    echo "success";
  } else { //looking for a full return
    // echo $sql;
    if (isset($result->num_rows)) {
      if ($result->num_rows > 0) {
        while ($row = $result->fetch_object()) {
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
