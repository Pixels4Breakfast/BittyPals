<?php
require_once "queryBase.php";

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////BEGIN QUERIES
///////////////////////////////////////////////////////////////////////////////////////////////PLAYER INVENTORY
if ($queryType == 'player_inventory') {
  scrubInventoryBank($o->id); //just...do that.  Yeah.
  $touchDB = false;  $override = true;

  ////////////////////////////////////////////////////////////////////////BEGIN REFACTOR
  $data = new stdClass();
  $data->items = [];




  $bank = $conn->query("SELECT id, active, in_storage, item_id, most_recent FROM inventory_bank WHERE pid = $o->id ORDER BY most_recent DESC") or die($conn->error);
  $rowcount = $bank->num_rows - 1;

  while ($rec = $bank->fetch_object()) {
    $iq = $conn->query("SELECT * FROM item WHERE id = $rec->item_id") or die($conn->error);
    $itemInfo = $iq->fetch_object();
    if ($itemInfo->type == 'pet') continue;  //do not include pets in the inventory

    $ob = new stdClass();
    $ob->name = $itemInfo->name;
    $ob->item_id = (int)$rec->item_id;
    $ob->tcount = $rec->active + $rec->in_storage;
    $ob->mid = $rec->most_recent;
    $ob->available = $rec->in_storage;



    //get widget data if it exists
    if ($itemInfo->wid > 0) {
      $wr = $conn->query("SELECT * FROM widget WHERE id = ".$itemInfo->wid) or die($conn->error);
      $w = $wr->fetch_object();
      if (isset($w->data)) {
        $w->data = preg_replace('!s:(\d+):"(.*?)";!e', "'s:'.strlen('$2').':\"$2\";'", $w->data);
        $w->data = unserialize($w->data);
        $itemInfo->widgetData = $w;
      }
    }

    $ob->item = $itemInfo;
    $data->items[] = $ob;

  }

  //sort the fucking things...
  if ($o->sort == 'name') {
    usort($data->items, function($a, $b) {
      return strcmp($a->name, $b->name);
    });
  } else {
    usort($data->items, function($a, $b) {
      return $b->mid - $a->mid;
    });
  }
  if ($o->dir == 'ASC') $data->items = array_reverse($data->items);

  ///////////////////////////////////////BEGIN CAVEATS
  //search {string}
  //category {int}
  //coin {silver, gold}
  //dir {ASC,DESC}
  //sort {[field]}
  //TODO: cull the list based on the parameters
  $returnData = new stdClass();
  // $returnData->rowcount = $rowcount;
  $returnData->items = [];
  $offCount = 0;
  $returnCount = 0;
  $filteredRowcount = 0;

  if (isset($o->filter)) {
    foreach($data->items as $item) {
      if ($item->item->type == 'pet'){ $returnData->petfound = true;}
      ///////////////////////CATEGORY FILTER
      if (isset($o->category)) {
        $itemcats = explode(",", $item->item->categories);
        if (array_search($o->category, $itemcats) === false) {continue;}  //not in category
      }
      if (isset($o->coin)) {if ((int)$item->item->{$o->coin} == 0) {continue;}}  //not in coin value
      if (isset($o->search)) {
        $s = trim($o->search); //clean exterior whitespace
        $sa = explode(" ", $s); //make go boom for array useness
        $flag = false;
        $searchString = strtolower($item->item->name.$item->item->keywords);
        foreach ($sa as $k => $v) {if (strpos(strtolower($searchString), strtolower($v)) !== false) {$flag = true;}}
        if (!$flag) {continue;}
      }

      $filteredRowcount++;
      ////made it through the filters, so add it to the dataset if there's room
      if ($returnCount < $o->limit && ($offCount > $o->offset-1 || $o->offset == 0)) {
        $returnCount++;
        $returnData->items[] = $item;
      } else { $offCount++; }  //if we haven't hit the offset, increment and move on
    }

    $returnData->rowcount = $filteredRowcount;
    $returnData->state = 'filtered';
  } else {
    $returnData = $data;
    $returnData->rowcount = $rowcount;
    $returnData->state = 'clone';
    $returnData->items = array_slice($returnData->items, $o->offset, $o->limit);
  }

  ///////////////////////////////////////END CAVEATS

  echo json_encode($returnData);
}


///////////////////////////////////////////////////////////////////////////////////////////////INVENTORY ITEM
else if ($queryType == 'inventory_item_to_habby') {
  $touchDB = false; $override = true;
  //create a new inventory record for the active item
  $conn->query("INSERT INTO inventory (pid, item_id, hid, active, x, y) VALUES ($o->pid, $o->id, $o->hid, 1, 500, 225)") or die($conn->error);
  $lid = $conn->insert_id;
  $r = $conn->query("SELECT * FROM item WHERE id = $o->id") or die($conn->error);


  //get the widget code
  $data = [];
    $row = $r->fetch_assoc();
    if ($row["wid"] > 0) {
      $wr = $conn->query("SELECT * FROM widget WHERE id = ".$row["wid"]) or die($conn->error);
      $w = $wr->fetch_object();
      if (isset($w->data)) {
        $w->data = preg_replace('!s:(\d+):"(.*?)";!e', "'s:'.strlen('$2').':\"$2\";'", $w->data);
        $w->data = unserialize($w->data);
        $row['widgetData'] = $w;
      }
    }
    $row['id'] = $lid;
    $row['base_id'] = $o->id;
    $row['pid'] = $o->pid;

    $data[] = $row;

  $conn->query("UPDATE inventory_bank SET in_storage = in_storage-1, active = active+1 WHERE pid = $o->pid AND item_id = $o->id") or die($conn->error);
  echo json_encode($data);
}

else if ($queryType == 'store_item') {
  $conn->query("UPDATE inventory_bank SET in_storage = in_storage+1, active = active-1 WHERE pid = $o->pid AND item_id = $o->itemID") or die($conn->error);
  $conn->query("DELETE FROM inventory WHERE id = $o->id") or die($conn->error);
  echo 'success';
}


else if ($queryType == "market" || $queryType == "admin") {
  $calcRows = true;
  $touchDB = false;
  $override = true;
  if ($o->prepared == "market") {
    $sql = "SELECT SQL_CALC_FOUND_ROWS id, name, src, description, categories, keywords, type, silver, gold, instore, is_sprite, frame_count, frame_height, frame_width, is_effect, effect_id, release_date, palette, wid FROM item WHERE instore = 1 AND release_date < '$timestamp'";
  } else {
    $sql = "SELECT SQL_CALC_FOUND_ROWS * FROM item WHERE id > 0";
  }
  if (isset($o->instore)) { $sql .= " AND (instore = $o->instore)"; }               //admin
  if (isset($o->interactive)) { $sql .= " AND (interactive = $o->interactive)"; }   //admin

  if (isset($o->category)) {
    $sql .= " AND (categories LIKE '$o->category,%' OR categories LIKE '%,$o->category,%' OR categories LIKE '%,$o->category' OR categories = '$o->category')";
  }
  if (isset($o->search)) {
    $t = trim($o->search); //clean exterior whitespace

    $e = explode(" ", $t);
    $ecount = count($e);
    for ($i = 0; $i < $ecount; $i++) {
      $e[$i] = trim($e[$i]); //clean internal whitespace
    }
    foreach ($e as $k => $v) {
      $sql .= " AND (keywords LIKE '%$v%' OR name LIKE '%$v%')";  //search must match all words
    }
  }

  if (isset($o->coin)) {
    $sql .= " AND ($o->coin > 0)";
  }

  if (isset($o->sort)) {
    $dir = "ASC";
    if (isset($o->dir)) $dir = $o->dir;
    if ($o->sort == "name") $dir = ($dir == "ASC") ? "DESC" : "ASC";  //flipping this because name sorting seems backwards...
    if ($o->sort == "cost") {
      if ($dir == "ASC") {
        $sql .= " ORDER BY gold ASC, silver ASC, name ASC";
      } else {
        $sql .= " ORDER BY gold DESC, silver DESC, name ASC";
      }
    } else {
      $sql .= " ORDER BY $o->sort $dir";
    }
  }
  // if (isset($o->offset)) {
  //   $sql .= " OFFSET $o->offset";
  // }
  if (isset($o->limit)) {
    $sql .= " LIMIT $o->offset, $o->limit";
  }


  $data = [];
  $inv = $conn->query($sql) or die($conn->error);

  $rcr = $conn->query("SELECT FOUND_ROWS() AS rowcount") or die($conn->error);
  $rc = $rcr->fetch_object()->rowcount;
  $data[] = ['rowcount' => $rc];


  while ($row = $inv->fetch_assoc()) {
    if ($row["wid"] > 0) {
      $wr = $conn->query("SELECT * FROM widget WHERE id = ".$row["wid"]) or die($conn->error);
      $w = $wr->fetch_object();
      if (isset($w->data)) {
        $w->data = preg_replace('!s:(\d+):"(.*?)";!e', "'s:'.strlen('$2').':\"$2\";'", $w->data);
        $w->data = unserialize($w->data);
        $row['widgetData'] = $w;
      }
    }
    $data[] = $row;
  }

  echo json_encode($data);
}

else if ($queryType == 'recycle') {
  $o = json_decode($_POST["p"], false); $touchDB = false;  $override = true;
  if (count($o->items) > 0) {
    $itemList = [];
    foreach($o->items as $k=>$v) {
      if (isset($itemList[$v])) {
        $itemList[$v]++;
      } else {
        $itemList[$v] = 1;
      }
    }

    //need to make sure that the sender currently has enough of all of the items to actually send the gift.  Otherwise, they're an asshole.

    foreach($itemList as $key=>$val) {
      $vres = $conn->query("SELECT in_storage FROM inventory_bank WHERE pid = $o->pid AND item_id = $key") or die($conn->error);
      if ($vres->fetch_assoc()['in_storage'] < $val) {
        die("You do not have enough items to recycle this list.  Please make sure you have not already recycled these items in another tab");
      }
    }



    foreach($itemList as $key=>$val) {
      $rQuery = "UPDATE inventory_bank SET in_storage = in_storage-$val WHERE item_id = $key AND pid = $o->pid";

      $conn->query($rQuery) or die($conn->error);

      $sres = scrubInventoryBank($o->pid, $key);
      if ($sres != 'success') {
        echo "FAIL:Failed to scrub bank on item $key\n\t\t$sres\n\n";
      }
    }
    echo 'success';
  } else {
    echo "FAIL:No items sent through Recyclotron";
  }

}



else {
  echo "inventoryQuery::Invalid queryType: $queryType";
}

@$conn->close();
?>
