<?php
require_once "queryBase.php";

if ($queryType == "split_inventory") {
  //time to do some crazy shit...
  $limit = 10000;
  // $conn->query("UPDATE inventory SET active = 0, hid = 0 WHERE hid = 0 OR hid IS NULL") or die($conn->error);  //fix the errors...remove this for live patch
  $r = $conn->query("SELECT SQL_CALC_FOUND_ROWS id, item_id, pid FROM inventory WHERE active = 0 OR hid = 0 ORDER BY id ASC LIMIT $limit") or die($conn->error);
  $tcr = $conn->query("SELECT FOUND_ROWS() as rowcount") or die($conn->error);
  $tcount = $tcr->fetch_assoc()['rowcount'];
  //this is going to be a beast...
  $deleteList = [];
  $valueSets = [];
  $sql = "INSERT INTO inventory_bank (pid, item_id, most_recent, active, in_storage)";
  $c = "";
  while ($record = $r->fetch_object()) {
    $deleteList[] = $record->id;
    $vlist = [];
    $vlist[] = $record->pid;
    $vlist[] = $record->item_id;
    $vlist[] = $record->id;
    $vlist[] = 0;
    $vlist[] = 1;
    $valueSets[] = "(".implode(',',$vlist).")";
    $c=",";
  }
  $values = implode(",", $valueSets);
  $sql .= " VALUES ".$values;
  $sql .= " ON DUPLICATE KEY UPDATE in_storage = in_storage+1, most_recent = VALUES(most_recent)";

  $conn->query($sql) or die($conn->error);
  $conn->query("DELETE FROM inventory WHERE id IN(".implode(',', $deleteList).")") or die($conn->error);


  $r = new stdClass();
  $r->total = $tcount;
  $r->remaining = ($tcount-$limit);
  echo json_encode($r);
}

else if ($queryType == 'split_active') {
  $limit = 10000;
  $r = $conn->query("SELECT SQL_CALC_FOUND_ROWS id, item_id, pid, hid FROM inventory WHERE active = 1 ORDER BY id ASC LIMIT $o->offset, $limit") or die($conn->error);
  $tcr = $conn->query("SELECT FOUND_ROWS() as rowcount") or die($conn->error);
  $tcount = $tcr->fetch_assoc()['rowcount'];
  //this is going to be a beast...
  $valueSets = [];
  $sql = "INSERT INTO inventory_bank (pid, item_id, most_recent, active, in_storage)";
  $c = "";
  while ($record = $r->fetch_object()) {
    $vlist = [];
    $vlist[] = $record->pid;
    $vlist[] = $record->item_id;
    $vlist[] = $record->id;
    $vlist[] = 1;
    $vlist[] = 0;
    $valueSets[] = "(".implode(',',$vlist).")";
    $c=",";
  }
  $values = implode(",", $valueSets);
  $sql .= " VALUES ".$values;
  $sql .= " ON DUPLICATE KEY UPDATE active = active+1, most_recent = VALUES(most_recent)";

  $conn->query($sql) or die($conn->error);

  $r = new stdClass();
  $r->remaining = ($tcount - $limit - $o->offset);
  $r->total = $tcount;
  $r->offset = ($o->offset + $limit);
  echo json_encode($r);
}

else {
  echo "flintQuery::Invalid queryType: $queryType";
}

@$conn->close();

?>
