<?php
require_once "queryBase.php";


if ($queryType == 'check_free_spin') {

  $r = $conn->query("SELECT last_free_spin FROM player WHERE id = $o->pid") or die($conn->error);
  $s = $r->fetch_object()->last_free_spin;
  $spinDif = timeDif($s)->d;
  echo ($spinDif > 0) ? 'true' : 'false';
}

else if ($queryType == 'update_spinner_prizes') {
  if (isset($o->prizes)) {
    $conn->query("DELETE FROM spinner_prizes") or die($conn->error);

    $c = "";
    $values = "";
    foreach($o->prizes as $k => $v) {
      $values .= $c."('$v->title','$v->description','$v->img','$v->type',$v->value)";
      $c = ",";
    }

    $sql = "INSERT INTO spinner_prizes (title, description, img, type, value) VALUES ".$values;
    // echo $sql;
    $conn->query($sql) or die($conn->error);
    echo "success";
  } else {
    echo "Spinner Prize Values Not Sent";
  }

}

else if ($queryType == 'get_spinner_prizes') {
  $r = $conn->query("SELECT * FROM spinner_prizes") or die($conn->error);

  $prizes = [];
  while ($prize = $r->fetch_object()) {
    //push them all into $data after formatting the assoc arrays
    $p = ['title'=>$prize->title, 'description'=>$prize->description, 'img'=>$prize->img, 'prize'=>['type'=>$prize->type, 'value'=>$prize->value]];


    if ($prize->type == 'item') {
      $ir = $conn->query("SELECT is_sprite, frame_count, frame_height, frame_width FROM item WHERE id = $prize->value")->fetch_object();
      if ($ir->is_sprite == 1) {
        $p['prize']['data'] = $ir;
      }
    }
    $prizes[] = $p;
  }
  $data["prizes"] = $prizes;
  $b = $conn->query("SELECT spinner_background FROM siteoptions") or die($conn->error);
  $back = $b->fetch_object();
  $data['background'] = $back->spinner_background;
  echo json_encode($data);
}

else if ($queryType == 'jackpot') { //do I actually need this anymore?
  //TODO: set up jackpot db structure
  echo "jackpot";
}

else {
  echo "spinnerQuery::Invalid queryType: $queryType";
}

@$conn->close();
?>
