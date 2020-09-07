<?php
include('./avatarFunctions.php');
ini_set("memory_limit", "99M");
ini_set('post_max_size', '20M');
ini_set('max_execution_time', 600);
define('IMAGE_DIR', 'assets/avatars/');
define('IMAGE_SIZE', 200);

function deleteOld($path,$match){
   static $deleted = 0,
   $dsize = 0;
   $files = glob($path."avatar_".$match."-*");
   foreach($files as $file) {
      if(is_file($file)){
         unlink($file);
      }
   }
}

if(isset($_FILES['image_upload_file'])){
	$output['status']=FALSE;
	set_time_limit(0);
	$allowedImageType = array("image/gif",   "image/jpeg",   "image/pjpeg",   "image/png",   "image/x-png"  );
	$pid = $_POST['pid'];
	if ($_FILES['image_upload_file']["error"] > 0) {
		$output['error']= "Error in File";
	}
	elseif (!in_array($_FILES['image_upload_file']["type"], $allowedImageType)) {
		$output['error']= "You can only upload JPG, PNG and GIF file";
	}
	elseif (round($_FILES['image_upload_file']["size"] / 1024) > 4096) {
		$output['error']= "You can upload files up to 4 MB";
	} else {
		$path[0] = $_FILES['image_upload_file']['tmp_name'];
		$file = pathinfo($_FILES['image_upload_file']['name']);
		$fileType = $file["extension"];
		$desiredExt='jpg';
		$fileNameNew = "avatar_$pid-".time().".$desiredExt";
		$path[1] = IMAGE_DIR . $fileNameNew;

		deleteOld("./assets/avatars/", $pid);

		if (createThumb($path[0], $path[1], $fileType, IMAGE_SIZE, IMAGE_SIZE, IMAGE_SIZE)) {
			$output['status']=TRUE;
			$output['image']= $path[1];
		}
	}
	echo json_encode($output);
}
?>
