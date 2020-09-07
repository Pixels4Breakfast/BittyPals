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


function resetPlot($thisPlotID) {
  global $conn;
  $conn->query("UPDATE garden_plot SET
        seed_id = 0,
        plant_id = 0,
        stage = 0,
        stage_increment = 12.00,
        planted_date = '0000-00-00 00:00:00',
        next_stage = '0000-00-00 00:00:00',
        last_watered = '0000-00-00 00:00:00',
        withered = 0,
        planter_id = 0,
        harvest_ready = 0,
        fertilizer = 0,
        mutated = 0
        WHERE id = $thisPlotID
        ") or die($conn->error);
}



$queryType = (isset($_GET["qType"])) ? $_GET["qType"] : "default";
$o = json_decode($_POST["p"], false);

switch ($queryType) {
  case "admin_get_plants":
    $pq = $conn->query("SELECT * FROM garden_plant ORDER BY family ASC") or die($conn->error);
    $plants = [];
    while($p = $pq->fetch_object()) {
      $plants[] = $p;
    }
    echo json_encode($plants);
  break;
  case "admin_get_seeds":
    $sq = $conn->query("SELECT * FROM garden_seed ORDER BY name ASC") or die($conn->error);
    $seeds = [];
    while($s = $sq->fetch_object()) {
      $seeds[] = $s;
    }
    echo json_encode($seeds);
  break;
  case "get_plant_families":
    $fq = $conn->query("SELECT DISTINCT family FROM garden_plant ORDER BY id ASC") or die($conn->error);
    $fams = [];
    while($f = $fq->fetch_object()) {
      $sFams = explode(",",$f->family);
      $fams = array_merge($fams, $sFams);
    }
    $sfq = $conn->query("SELECT DISTINCT family FROM garden_seed") or die($conn->error);
    while($s = $sfq->fetch_object()) {
      $sfFams = explode(",",$s->family);
      $fams = array_merge($fams, $sfFams);
    }
    $fams = array_unique($fams);
    sort($fams);
    foreach ($fams as $k => $v) $fams[$k] = ucwords($v);

    echo json_encode($fams );
  break;
  case "get_seed_plant_list":
    $fams = explode(",", $o->family);

    $q = "SELECT id, name, level FROM garden_plant WHERE ";
    $q .= ($o->type != 'All') ? "plant_type LIKE '%$o->type%' AND " : "";
    $q .= ($o->level != 'All')? "level LIKE '$o->level' AND " : "";
    if (count($fams) > 1) {
      $or = "";
      $q .= "(";
      for ($i=0;$i<count($fams);$i++) {
        $q .= $or."family LIKE '%$fams[$i]%' ";
        $or = "OR ";
      }
      $q .= ") ";
    } else {
      $q .= "family LIKE '%$fams[0]%' ";
    }

    $q .= "ORDER BY name ASC";
    //TODO: need to set the family up to sort through all families...

    $lQ = $conn->query($q) or die($conn->error);

    $plants = [];
    while($l = $lQ->fetch_object()) {
      $plants[] = $l;
    }
    // echo $q;
    echo json_encode($plants);
  break;
  case "fetch_plant_entries":
    $sql = "SELECT id, name, level, family, plant_type FROM garden_plant WHERE id IN ($o->plantList)";
    $q = $conn->query($sql) or die($conn->error.'\n'.$sql);
    $r = [];
    while($p = $q->fetch_object()) {
      $r[] = $p;
    }
    echo json_encode($r);
  break;


  case "fetch_plant_list":
    $touchDB = true;
    $sql = "SELECT id, name FROM item WHERE garden_plant = 1 ORDER BY name ASC";
    // $sql = "SELECT item.id, item.name, garden_item.rid FROM item INNER JOIN garden_item WHERE garden_item.iid = item.id AND garden_item.type = 'plant' ORDER BY item.name ASC";
  break;
  case "fetch_garden_item_list":
    $touchDB = true;
    // this will pull the seeds and fertilizers (and the harvestable items)
    $sql = "SELECT id, name FROM item WHERE harvestable = 1 ORDER BY name ASC";
    // $sql = "SELECT item.id, item.name, garden_item.rid FROM item INNER JOIN garden_item WHERE garden_item.iid = item.id AND garden_item.type != 'plant' ORDER BY name ASC";
  break;
  case "fetch_mulch_list":
    //yes, this is currently redundant, but I'm planning on refactoring, so I'm leaving this here as a placeholder.
    $touchDB = true;
    $sql = "SELECT id, name FROM item WHERE garden_plant = 1 ORDER BY name ASC";
  break;

  case "fetch_seeds_and_fertilizers":
    $things = [];
    $q = "SELECT i.name, i.id
          FROM garden_item l
          INNER JOIN item i
          ON l.iid = i.id
          WHERE l.type = 'seed' OR l.type = 'fertilizer'";
    $idr = $conn->query($q) or die($conn->error);
    if ($idr->num_rows > 0) {
      while($item = $idr->fetch_object()) $things[] = $item;
    }
    echo json_encode($things);
  break;


  case "insert_seed":
    $gc = $conn->query("SELECT id FROM categories WHERE name LIKE 'garden'") or die($conn->error);
    $gcid = $gc->fetch_object()->id;
    $sql = "INSERT INTO garden_seed (";
    $sql2 = "VALUES (";
    $c = "";

    $type = "";

    $isql = "INSERT INTO item (categories, release_date, harvestable, keywords, instore, type";
    $isql2 = ") VALUES($gcid, '$now', 1, 'garden,seed', 0, 'item'";
    $ic = "";
    $itemInclusions = ["type", "src", "name", "description", "garden_plant", "harvestable", "keywords", "gold", "silver"];

    foreach($o->values as $k => $v) {
      if ($v->name == 'type') $type = $v->value;
      if (gettype($k) == 'integer') {  //name/value pairs
        $sql .= $c."$v->name";
        if ($v->name == "release_date") {
          $v->value = date_create_from_format("m-d-Y", $v->value);
          $v->value = $v->value->format('Y-m-d');
        }
        if ($v->value === "NOW") $v->value = "$now";
        $v->value = addslashes($v->value);
        $sql2.= $c."'$v->value'";
      } else if (gettype($k) == 'string') {  //direct objects
        if ($k == "id") continue;
        $sql .= $c."$k";
        if ($k == "release_date") {
          $v = date_create_from_format("m-d-Y", $v);
          $v = $v->format('Y-m-d');
        }
        if ($v === "NOW") $v = "$now";
        $v = addslashes($v);
        $sql2.= $c."'$v'";
      }
      $c = ", ";
      if (array_search($v->name, $itemInclusions) !== FALSE) {
        if ($v->name != 'type') {
          $isql .= ",$v->name";
          $isql2 .= ",'$v->value'";
        }
      }
      if ($v->name == 'type' && $v->value == 'fertilizer') {
      $isql .= ",garden_plant";
      $isql2 .= ",1";
      }
    }

    $isql .= $isql2.")";

    $sql .= ") ".$sql2.")";
    // $responseFlag = true;

    //create the linkage lookup in garden_item with $conn->insert_id
    $conn->query($sql) or die($sql.'\n'.$conn->error);
    $rid = $conn->insert_id;
    $conn->query($isql) or die($isql.'\n'.$conn->error);
    $iid = $conn->insert_id;
    $linkSQL = "INSERT INTO garden_item (type, iid, rid) VALUES ('$type', $iid, $rid)";
    $conn->query($linkSQL) or die($conn->error);


    //testing
    // echo $isql;
    echo 'success';
    return;

  break;


  case "delete_seed":
    $ir = $conn->query("SELECT * FROM garden_seed WHERE id = $o->id") or die($conn->error);
    $seed = $ir->fetch_object();
    $src = $seed->src;
    $type = $seed->type;
    $id = $o->id;
    //remove all inventory items?
    $conn->query("DELETE FROM garden_item WHERE type ='$type' AND rid = $id") or die($conn->error);

    // $conn->query("DELETE FROM inventory WHERE item_id = $o->id") or die($conn->error);
    $conn->query("DELETE FROM garden_seed WHERE id = $o->id") or die($conn->error);


    // if (!@unlink($src)) {
    //   echo "ERROR: could not unlink file.  Database records successfully deleted.";
    // } else {
    //   echo "success";
    // }
    echo "success";

  break;

  case "delete_plant":
    $ir = $conn->query("SELECT * FROM garden_plant WHERE id = $o->id") or die($conn->error);
    $plant = $ir->fetch_object();
    $src = $plant->stage_src;
    $id = $o->id;
    //remove all inventory items
    // $conn->query("DELETE FROM inventory WHERE item_id = $o->id") or die($conn->error);
    $conn->query("DELETE FROM garden_plant WHERE id = $o->id") or die($conn->error);
    if (!@unlink($src)) {
      echo "ERROR: could not unlink file.  Database records successfully deleted.";
    } else {
      echo "success";
    }
  break;


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////GARDEN MECHANICS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////GARDEN MECHANICS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////GARDEN MECHANICS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////GARDEN MECHANICS

  case "fetch_garden":
    $g = $conn->query("SELECT * FROM garden WHERE pid = $o->pid") or die($conn->error);
    if ($g->num_rows == 0) {
      //create the garden, then fetch it.
      $conn->query("INSERT INTO garden (pid) VALUES($o->pid)") or die($conn->error);
      $g = $conn->query("SELECT * FROM garden WHERE pid = $o->pid") or die($conn->error);
    }
    $gr = $g->fetch_object();

    //now get the plots or create the first three if they don't exist
    $p = $conn->query("SELECT * FROM garden_plot WHERE gid = $gr->id") or die($conn->error);
    if ($p->num_rows == 0) {
      for ($i=0; $i<3; $i++) {
        $conn->query("INSERT INTO garden_plot(pid, gid) VALUES ($o->pid, $gr->id)") or die($conn->error);
      }
      $p = $conn->query("SELECT * FROM garden_plot WHERE gid = $gr->id") or die($conn->error);
    }
    $gr->plots = [];
    while ($plot = $p->fetch_object()) {
      //get the plant objects if they exist
      if ($plot->plant_id != 0) {
        $pl = $conn->query("SELECT * FROM garden_plant WHERE id = $plot->plant_id") or die($conn->error);
        if ($pl->num_rows != 1) {
          die("ERROR:: could not find plant ID -> $plot->plant_id for plot $plot->id");
        } else {
          $plot->plant = $pl->fetch_object();
          $plot->plant->stage_names = explode(",",$plot->plant->stage_names);
          $plot->plant->harvest_count = explode(",",$plot->plant->harvest_count);
          $plot->plant->harvest_items = explode(",",$plot->plant->harvest_items);
        }
      } else {
        $plot->plant = (object) [];  //insert empty object
      }
      //get the seed info that they used when planting
      if ($plot->seed_id != 0) {
        $se = $conn->query("SELECT * FROM garden_seed WHERE id = $plot->seed_id") or die($conn->error);
        if ($se->num_rows != 1) {
          die("ERROR:: could not find seed ID -> $plot->seed_id for plot $plot->id");
        } else {
          $plot->seed = $se->fetch_object();
        }
      }

      $mod = [
        "rarity"=>0,
        "count"=>0,
        "time"=>0,
        "mutate"=>0
      ];

      if ($plot->fertilizer != "" && $plot->fertilizer != 0) {
        //fertilizers found.  Split and apply.
        $fertIDs = explode(",", $plot->fertilizer);
        $ferts = [];

        $fQuery = $conn->query("SELECT * FROM garden_seed WHERE id IN ($plot->fertilizer)") or die($conn->error);
        while ($fert = $fQuery->fetch_object()) {
          for ($i=0; $i<count($fertIDs); $i++) {
            if ($fert->id != $fertIDs[$i]) continue;
            $thisMods = explode(",", $fert->on_use);
            foreach($thisMods as $k => $v) {
              $boom = explode(":", $v);
              if(!isset($mod[$boom[0]])) {
                $mod[$boom[0]] = $boom[1];
              } else {
                $mod[$boom[0]] = $mod[$boom[0]] + $boom[1];
              }
            }
            $ferts[] = $fert;
          }

        }


        $plot->fertilizers = $ferts;
      }
      $plot->mods = $mod;

      //watering
      if ($plot->seed_id != 0) {
        $witherFlag = false;
        $lWatered = date_create($plot->last_watered);
        $rightNow = date_create($timestamp);  //yes, it's redundant
        $waterDiff = date_diff($lWatered, $rightNow);
        if ($waterDiff->format("%a") > 0) {
          //plant is withered, and we can skip the rest of the processing
          $conn->query("UPDATE garden_plot SET withered = 1 where id = $plot->id") or die($conn->error);
          $plot->wdiff = (object)["d"=>1, "h"=>0, "m"=>0];
          $plot->withered = 1;
        } else {
          $plot->wdiff = (object)["d"=>$waterDiff->format("%a"), "h"=>$waterDiff->format("%h"), "m"=>$waterDiff->format("%i")];
        }
      }

      //check the growth interval and set the current stage
      $growthFlag = false;
      $processingGrowth = ($plot->seed_id == 0 || $plot->withered == 1) ? false : true;
      while($processingGrowth) {
        $nStageDate = date_create($plot->next_stage);
        $rightNow = date_create($timestamp);

        if ($plot->withered == 1) {
          //if the plot is withered, we need to make 'rightNow' = 23 hours from the last_watered date (they get docked an hour for being bad plant parents)
          $wateredAt = date_create($plot->last_watered);
          date_add($wateredAt, date_interval_create_from_date_string("23 hours"));
          $rightNow = $wateredAt;  //hopefully this works...

        }
        $diff = date_diff($nStageDate, $rightNow);


        $plot->diff = $diff->format("%h:%i:%s");
        if ($diff->format("%R") === "+") {
          if ($plot->stage == $plot->plant->stages) {
            $processingGrowth = false;
            break;
          }
          $interval = 60 * ($plot->stage_increment - $plot->mods["time"]);
          if ($interval < 0) $interval = 5;
          date_add($nStageDate, date_interval_create_from_date_string($interval." minutes"));
          $plot->next_stage = date_format($nStageDate, "Y-m-d H:i:s");
          if ($plot->plant->stages > $plot->stage && $plot->withered == 0) $plot->stage++;
          if ($plot->withered == 0) $growthFlag = true;
        } else {
          $processingGrowth = false;
        }
      }
      if ($growthFlag) {
        //update the plot and the db record
        $conn->query("UPDATE garden_plot SET stage = $plot->stage, next_stage = '$plot->next_stage' WHERE id = $plot->id") or die($conn->error);

      }
      if (isset($plot->plant->stages)) {
        if ($plot->stage == $plot->plant->stages) {
          $conn->query("UPDATE garden_plot SET harvest_ready = 1 WHERE id = $plot->id") or die($conn->error);
        }
      }



      $gr->plots[] = $plot;
    }

    //check if is friend
    if ($o->pid == $o->visitorID) {
      $gr->isFriend = 1;  //because reasons
      $gr->canWater = 1;
    } else {
      $fRes = $conn->query("SELECT * FROM friends WHERE pid = $o->pid AND fid = $o->visitorID") or die($conn->error);
      if ($fRes->num_rows > 0) {
        $fr = $fRes->fetch_object();
        $gr->isFriend = ($fr->type == 'friend') ? 1 : 0;
        //assume that they have played with that person at least once, so we can check the last watered date
        $lastWatered = date_create($fr->f_watered);
        //check to see if it has been at least a day since the last watering;
        $rightNow = date_create($timestamp); //still redundant
        date_add($lastWatered, date_interval_create_from_date_string("24 hours"));
        $lDiff = date_diff($lastWatered, $rightNow);
        if ($lDiff->format("%R") === "+") {
          //it's been over 24 hours, so they're allowed to water
          $gr->canWater = 1;
        } else {
          $wsd = $lDiff->format("%h:%i:%s");  //water string diff...or something like that...
          $wob = explode(":",$wsd);
          $fwc = new stdClass();
            $fwc->h = $wob[0];
            $fwc->m = $wob[1];
            $fwc->s = $wob[2];
          $gr->canWater = 0;
          $gr->fWaterCountdown = $fwc;
        }

      } else {
        $gr->isFriend = 0;
        $gr->canWater = 0;  //use this to track people who have never played with that person
        //set an actual countdown object?
      }
    }



    echo json_encode($gr);

  break;

  case "get_garden_items":
    // $listsql = $conn->query("SELECT i.id AS item_id, i.name, s.src, s.level, s.mutate_chance, s.family, s.rarity, s.on_use, g.rid AS seed_id, v.id AS inv_id, s.type AS item_type
    //                         FROM item i
    //                         INNER JOIN garden_item g ON g.iid = i.id
    //                         INNER JOIN garden_seed s ON s.id = g.rid
    //                         INNER JOIN inventory v ON i.id = v.item_id
    //                         WHERE v.pid = $o->pid AND v.active = 0
    //                         ORDER BY i.name ASC") or die($conn->error);

    //refactor query
    $playerItems = [];
    $plist = [];
    $plt = $conn->query("SELECT item_id, in_storage FROM inventory_bank WHERE pid = $o->pid") or die($conn->error);
    while($pitem = $plt->fetch_object()) {
      $playerItems[] = $pitem;
      $plist[] = $pitem->item_id;
    }
    $plist = implode(",", $plist);
    //get the entire garden item repository as a lookup table
    $listsql = $conn->query("SELECT i.id AS item_id, i.name, s.src, s.level, s.mutate_chance, s.family, s.rarity, s.on_use, g.rid AS seed_id, s.type AS item_type
                            FROM item i
                            INNER JOIN garden_item g ON g.iid = i.id
                            INNER JOIN garden_seed s ON s.id = g.rid
                            WHERE i.id IN ($plist)
                            ORDER BY i.name ASC") or die($conn->error);
    $r = [];
    while($l = $listsql->fetch_object()) {
      $r[] = $l;
      foreach ($playerItems as $k=>$v) {
        if ($v->item_id == $l->item_id) {
          $l->in_storage = $v->in_storage;
          break;
        }
      }
    }
    echo json_encode($r);
  break;


  case "plant_garden_seed":
    //get the seed vars
    $sq = $conn->query("SELECT * FROM garden_seed WHERE id = ".$o->seed->seed_id) or die($conn->error);
    $seed = $sq->fetch_object();

    $plot = new stdClass();
    $plot->id = $o->plot->id;

    $plot->pid = $o->pid;
    $plot->seed_id = $seed->id;
    $plot->gid = $o->gid;
    $plot->stage = 1;
    $plot->planted_date = $timestamp;
    $plot->last_watered = $timestamp;
    $plot->withered = 0;
    $plot->harvest_ready = 0;
    $plot->fertilizer = "";
    $plot->mutated = 0;
    $plot->plant_id = 0;  //modify for pulling the correct info after all variables have been processed
    $plot->stage_increment = 12;  //this gets finalized after plant selection

    $family = 'random';
    $level = 'All';
    $plantType = 'All';

    //delete list
    // $seedsToDelete = [$o->seed->inv_id];
    $seedsToDelete = [$o->seed->item_id];

    /////////////////////////////////////////////////////////////fertilizer mods
    if (count($o->ferts) > 0) {
      for ($i=0; $i<count($o->ferts); $i++) {
        // $seedsToDelete[] = $o->ferts[$i]->inv_id;
        $seedsToDelete[] = $o->ferts[$i]->item_id;
        if ($plot->fertilizer != "") $plot->fertilizer .= ",";
        $plot->fertilizer .= $o->ferts[$i]->seed_id;
      }
    }
    // array_rand($arr,1); //returns key
    $mod = [
      "rarity"=>0,
      "count"=>0,
      "time"=>0,
      "mutate"=>0
    ];

    if ($plot->fertilizer != "" && $plot->fertilizer != 0) {
      //fertilizers found.  Split and apply.
      $fertIDs = explode(",", $plot->fertilizer);
      $ferts = [];

      $fQuery = $conn->query("SELECT * FROM garden_seed WHERE id IN ($plot->fertilizer)") or die($conn->error);
      while ($fert = $fQuery->fetch_object()) {
        for($i=0; $i<count($fertIDs); $i++) {
          if ($fert->id != $fertIDs[$i]) continue;
          $thisMods = explode(",", $fert->on_use);
          foreach($thisMods as $k => $v) {
            $boom = explode(":", $v);
            $mod[$boom[0]] = $mod[$boom[0]] + $boom[1];
          }
        }

        // $ferts[] = $fert;
      }
      // $fertilizers = $ferts;
    }
    /////////////////////////////////////////////////////////end fertilizer mods



    if ($seed->plant_list != "") {
      //select plant from list
      $parr = explode(",", $seed->plant_list);
      $plot->plant_id = $parr[array_rand($parr,1)];
      //need to get the actual stage_increment from garden_plant
      $pr = $conn->query("SELECT * FROM garden_plant WHERE id = $plot->plant_id") or die($conn->error);
      $plantThing = $pr->fetch_object();
      $plot->stage_increment = $plantThing->stage_increment;

    } else {
      //start breaking down the variables (type, level, family)
      $farr = explode(",", $seed->family);
      $family = $farr[array_rand($farr,1)];

      $level = $seed->level;
      $plantType = $seed->plant_type;



      //mutation factor
      if ($seed->mutate_chance != 0) {
        $mChance = $seed->mutate_chance + $mod["mutate"];
        if (mt_rand(0,100) < $mChance) {
          $plot->mutated = 1;
          $level = $seed->mutate_level;
        }

      } else {
        //there is no mutation chance, so fertalizers will not affect it, and it cannot mutate
      }


      $plQ = "SELECT id, stage_increment FROM garden_plant WHERE ";
      if ($level != "All") $plQ .= "level LIKE '$level' AND ";
      if ($plantType != "All") $plQ .= "plant_type LIKE '$plantType' AND ";
      if ($family != 'random') $plQ .= "family LIKE '%$family%' AND ";
      $plQ .= "id > 0";

      $plantList = [];
      $slR = $conn->query($plQ) or die($conn->error);
      while($pr = $slR->fetch_object()) $plantList[] = $pr;
      $plantOb = $plantList[array_rand($plantList,1)];
      $plot->plant_id = $plantOb->id;
      $plot->stage_increment = $plantOb->stage_increment;
    }







    //calculate $plot->next_stage
    $dPlanted = date_create($timestamp);
    //convert the increment to minutes
    $interval = 60 * ($plot->stage_increment - $mod["time"]);
    if ($interval < 0) $interval = 5;
    date_add($dPlanted, date_interval_create_from_date_string($interval." minutes"));
    $plot->next_stage = date_format($dPlanted, "Y-m-d H:i:s");


    //set the final mutate chance and see if the plant has mutated unless there is a specified list
    if ($seed->mutate_chance != 0 && $seed->plant_list == "") {

    }


    $plantSQL = "UPDATE garden_plot SET ";
    $c = "";
    foreach($plot as $k => $v) {
      $plantSQL .= $c."$k = '$v'";
      $c = ",";
    }
    $plantSQL .= " WHERE id = $plot->id";

    $conn->query($plantSQL) or die($conn->error);



    //delete seed and fertalizers from inventory
    // $delImplode = implode(',', $seedsToDelete);
    // $invDelete = "DELETE FROM inventory WHERE id IN ($delImplode)";
    // $conn->query($invDelete) or die($conn->error);

    foreach($seedsToDelete as $k=>$v) {
      $conn->query("UPDATE inventory_bank SET in_storage=in_storage-1 WHERE pid = $o->pid AND item_id = $v") or die($conn->error);
    }

    // print_r($plot);
    // echo $invDelete;
    echo "success";

  break;

  case "get_harvest":
    $pid = $o->pid;

    $data = new stdClass();
    $data->items = [];
    $data->plotID = $o->plotID;

    //catch plots that have already been harvested and make sure that they aren't cheating the system
    $pCheck = $conn->query("SELECT harvest_ready FROM garden_plot WHERE id = $o->plotID") or die($conn->error);
    $isReady = $pCheck->fetch_object()->harvest_ready;
    if ($isReady == 0 && $o->pid != 201) {
      $data->message = "No harvest available at this time";
      echo json_encode($data);
      return;
    }

    if ($o->witherSrc != "") {
      $wQ = $conn->query("SELECT id FROM item WHERE src LIKE '$o->witherSrc'") or die($conn->error);
      $o->items[] = $wQ->fetch_object()->id;
    }


    for ($i=0; $i<count($o->items); $i++) {
      $ir = $conn->query("SELECT * FROM item WHERE id = ".$o->items[$i]) or die($conn->error);
      if ($ir->num_rows == 0) {
        echo "ERROR: Could not find item ".$o->items[$i];
        return;
      }
        $item = $ir->fetch_object();
        $ob = new stdClass();
        $ob->name = $item->name;
        $ob->src = $item->src;
        $ilu = $conn->query("SELECT
          g.type, s.rarity
          FROM garden_item g
          INNER JOIN garden_seed s ON s.id = g.rid
          WHERE g.iid = $item->id
          ") or die($conn->error);
          if ($ilu->num_rows == 1 ) {
            $ob->rarity = $ilu->fetch_object()->rarity;
          } else {
            $ob->rarity = "none";
          }
        $data->items[] = $ob;

        //insert the item into the player inventory
      // $conn->query("INSERT INTO inventory (pid, hid, item_id, date_purchased) VALUES ($o->pid, 0, $item->id, '$timestamp')") or die($conn->error);
      $conn->query("INSERT INTO inventory_bank (pid, item_id, in_storage, most_recent)
                    VALUES ($o->pid, $item->id, 1, $snow)
                    ON DUPLICATE KEY UPDATE in_storage=in_storage+1, most_recent = $snow")
                    or die($conn->error);

      //clear the plot
      resetPlot($o->plotID);
    }

    echo json_encode($data);
  break;

  case "water_plot":
    //get the plot last_watered and verify that they're not gaming the system
    $ret = new stdClass();
    $ret->canwater = 1;
    $ret->plotID = $o->plotID;
    $ret->divID = $o->divID;
    $ret->owner = 1;
    if (isset($o->guest)) $ret->owner = 0;

    $pres = $conn->query("SELECT last_watered FROM garden_plot WHERE id = $o->plotID") or die($conn->error);
    $lwatered = $pres->fetch_object()->last_watered;
    if ($lwatered == '0000-00-00 00:00:00') {  //plot has been emptied, either by another player, or in another tab.  Halt and kill.
      $ret->canwater = 0;
      $ret->reason = "noPlant";
      echo json_encode($ret);
      return;
    }

    $ldate = date_create($lwatered);
    $rightNow = date_create($timestamp);
    date_add($ldate, date_interval_create_from_date_string("1 hour"));
    $ldiff = date_diff($ldate, $rightNow);

    if ($ldiff->format("%R") === "-") {
      //plot has been watered in the background, either by another player, or in another tab.  Halt and kill.
      $ret->canwater = 0;
      $ret->reason = "alreadyWatered";
      echo json_encode($ret);
      return;
    }


    $conn->query("UPDATE garden_plot SET last_watered = '$timestamp' WHERE id = $o->plotID") or die($conn->error);

    if (isset($o->guest)) {
      //need to update the friend records
      $fsql1 = "UPDATE friends SET watered_f = '$timestamp' WHERE pid = $o->pid AND fid = $o->fid";
      $fsql2 = "UPDATE friends SET f_watered = '$timestamp' WHERE pid = $o->fid AND fid = $o->pid";
      $conn->query($fsql1) or die($fsql1.$conn->error);
      $conn->query($fsql2) or die($fsql2.$conn->error);
    }

    echo json_encode($ret);

  break;


  case "resuscitate_plot":
    $touchDB = true;
    //get the stage increment and set a new next stage date
    $interval = 60 * $o->stageIncrement;
    if ($interval < 0) $interval = 5;
    $nStageDate = date_create($timestamp);
    date_add($nStageDate, date_interval_create_from_date_string($interval." minutes"));
    $nStage = date_format($nStageDate, "Y-m-d H:i:s");

    $sql = "UPDATE garden_plot SET withered = 0, last_watered = '$timestamp', next_stage = '$nStage' WHERE id = $o->plotID";
  break;

  case "mulch_plant":
    $rarity = $o->rarity;
    $plotID = $o->plotID;
    $data = new stdClass();
    $data->plotID = $plotID;
    $data->items = [];

    $pCheck = $conn->query("SELECT plant_id FROM garden_plot WHERE id = $o->plotID") or die($conn->error);
    $isReady = $pCheck->fetch_object()->plant_id;
    if ($isReady == 0) {
      //they suck, and we're not giving them anything.
      $data->message = "No mulch available at this time";
      echo json_encode($data);
      return;
    }

    //TODO: get the actual mulching data?  Do something fun?  Pull a random fertilizer for right now?
    $mQ = $conn->query("SELECT
        garden_plant.mulch_harvest, garden_plot.plant_id, item.name, item.src, item.id
        FROM garden_plant
        INNER JOIN garden_plot ON garden_plot.plant_id = garden_plant.id
        INNER JOIN item ON item.id = garden_plant.mulch_harvest
        WHERE garden_plot.id = $plotID
      ") or die($conn->error);
    if ($mQ->num_rows != 1) {
      echo "ERROR: shit done broke";
      return;
    }
    $item = $mQ->fetch_object();
    $ob = new stdClass();
    $ob->name = $item->name;
    $ob->src = $item->src;
    $data->items[] = $ob;

    // $conn->query("INSERT INTO inventory (pid, hid, item_id, date_purchased) VALUES ($o->pid, 0, $item->id, '$timestamp')") or die($conn->error);
    $conn->query("INSERT INTO inventory_bank (pid, item_id, in_storage, most_recent)
                  VALUES ($o->pid, $item->id, 1, $snow)
                  ON DUPLICATE KEY UPDATE in_storage=in_storage+1, most_recent=$snow")
                  or die($conn->error);

    resetPlot($o->plotID);
    echo json_encode($data);
  break;


////////////////////////////////////////////////////////////////////////////////GARDEN STORE
////////////////////////////////////////////////////////////////////////////////GARDEN STORE
////////////////////////////////////////////////////////////////////////////////GARDEN STORE
////////////////////////////////////////////////////////////////////////////////GARDEN STORE
  case "admin_get_store":
    $records = [];
    $sres = $conn->query("SELECT * FROM store_item ORDER BY active DESC") or die($conn->error);
    if ($sres->num_rows > 0) {
      while($record = $sres->fetch_object()) {
        $items = explode(",", $record->items);
        if ($record->items != "") {
          foreach($items as $k => $v) {
            $ithing = explode(":", $v);
            $items[$k] = new stdClass();
            $items[$k]->id = $ithing[0];
            $items[$k]->count = $ithing[1];
            $items[$k]->name = $conn->query("SELECT name FROM item WHERE id = $ithing[0]")->fetch_object()->name;
          }
        }
        $record->items = $items;
        $records[] = $record;
      }
    } else {
      //do nothing?
    }
    echo json_encode($records);
  break;

  case "delete_store":
    $touchDB = true;
    $src = $conn->query("SELECT src FROM store_item WHERE id = $o->id")->fetch_object()->src;
    @unlink($src);//delete the sale image (just make sure you don't use the same one for multiple sales)
    $sql = "DELETE FROM store_item WHERE id = $o->id";
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
