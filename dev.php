
<?php
require_once "overhead.php";
// if (isset($_SESSION['player_id'])) {
//   $pid = $_SESSION['player_id'];
// } else {
//   header("Location:home");
// }

?>
<!DOCTYPE html>

<html>
<head>
<meta http-equiv="X-UA-Compatible" content="IE=edge" />

<title>Dev Page</title>
<?php echo $requiredHead; ?>

<link rel="stylesheet" href="css/habitat.css" />
<script src="js/sounds.js"></script>

<script src="js/animateSprite.js?v=<?php echo mktime(); ?>"></script>
<script src="js/Sprite.js?v=<?php echo mktime(); ?>"></script>
<script src="js/Effect.js"></script>

<?php includeJSDir('js/widgets/'); ?>

<script>
  <?php echo $baseJSVars; ?>
  $(document).ready(function () {
    $("#habName").html("Renaissance Engineer Tools");
    loadSounds();
    doStuff();
  });


  var starOb = {
    target:"fxTarget",
    src:"assets/item/effect/fx_star.png",
    dir:'forward',
    parallax:'1',
    parallax_depth:'6',
    origin_x:'563',
    origin_y:'215',
    speed:"3",
    max_count:'200',
    tps:'75'
  };

  // var starFX = new HabEffect(starOb);
  // starFX.play();

function changeBackgroundColor(color) {
  $("#fxTarget").css('background-color', color);
}
function loadSprite() {
  $("#headStuff").empty();
  $("#fxTarget").empty();
  $("#fxTarget").append('<img style="position:absolute; left:0px; max-width:1126px;" id="spriteTarget"/>');

  var imageUpload = $("<form/>", { id:"imageUpload", action:"", method:"post", enctype:"multipart/form-data"});
      imageUpload.append($("<input/>", { type:"file", name:"file", id:"file", required:"required"}));
  var svDiv = $("<div/>");
      svDiv.append('#Frames: <input type="text" style="width:30px; margin-right:10px;" id="frameCount" />');
      svDiv.append('Frame Width: <input type="text" style="width:30px; margin-right:10px;" id="frameWidth" />');
      svDiv.append('Frame Height: <input type="text" style="width:30px; margin-right:10px;" id="frameHeight" />');
      svDiv.append('<br /><button onclick="testSprite()">Test Sprite</button>');

  $("#headStuff").append(imageUpload);
  $("#headStuff").append(svDiv);
  initFileUpload();
}

  // Function to preview image after validation
var tempFile;
function initFileUpload() {
  $(function() {
    $("#file").change(function() {
      // $("#message").empty(); // To remove the previous error message
      var file = this.files[0];
      var imagefile = file.type;
      var match= ["image/jpeg","image/png","image/jpg","image/gif"];
      if(!((imagefile==match[0]) || (imagefile==match[1]) || (imagefile==match[2]) || (imagefile==match[3]))) {
        $('#i_000_img').attr('src','');
        return false;
      } else {
        var reader = new FileReader();
        reader.onload = function(e) {
          $('#spriteTarget').attr('src', e.target.result);
          tempFile = e.target.result;
        };
        reader.readAsDataURL(this.files[0]);
      }
    });
  });
}

function testSprite() {
  console.log("Testing Sprite");
  var frameHeight = $("#frameHeight").val();
  var frameWidth = $("#frameWidth").val();
  var frameCount = $("#frameCount").val();
  var frames = [];
  for (var i = 0; i < frameCount; i++) frames.push(i);

  var img = $("<div/>", {id:"spriteTarget", class:"item", style:"height:" + frameHeight + "px; width:" + frameWidth + "px; position:relative; top:20px;"});
  $("#spriteTarget").replaceWith(img);
  img.css('background-image', 'url('+tempFile+')');

  img.animateSprite({
    fps: 24,
    animations: {
      looping: frames
    },
    loop: true,
    complete: function() {
      // use complete only when you set animations with 'loop: false'
      alert("animation End");
    }
  });

}







function aQuery(ob, cb, str) { paramQuery(ob, cb, str, 'adminQuery'); }


////////////////////////////////////////////////////////////////////////////////Dev Testing
function getRandomImage() {
  var imgs = [
    'assets/item/vegetable_withered_item.png',
    'assets/item/flower_withered_item.png',
    'assets/item/shrub_withered_item.png',
    // 'assets/item/tree_withered_item.png',
    'assets/item/dragon_withered_item.png'];
  return imgs[Math.floor(Math.random() * imgs.length)];
}

var p = {seven:7};

console.log(`The number x2 is ${p.seven * 2}`);

function confirm(r) {
  console.log(r);
}







function doStuff() {

  var imgCon = $("#loader");
  var image = new Sprite({id:42, framecount:24, src:"assets/item/w_CON_NorthPoleDancer.png", width:170, height:220, loop:true});

  //TODO: this should all be internal to Sprite
  if (image.init()) {
    image.setClass("centerHV");
    image.appendTo(imgCon);
    image.container.click(function(){image.click()});
    image.start();
  } else {
    console.error("failed to load sprite");
  }
  //widget attachment
  var ca = new Controller({
    name:"flashstuff",
    loops:5,
    controlType: "toggle",
    frameset:getRangeArray("24-47"),
    keyframes:[28,29,30,31,32,33,34,35,36,37,38,39,40],
    sound_click:"assets/sound/widget/deckTheHallsShort.mp3"
  }).attach(image);  //inline coding for the win...

  // var wob = {
  //   name:"flashing",
  //   loops:1,
  //   frameset:"23-63"
  // }
  // wob.frameset = getRangeArray(wob.frameset);
  // aQuery({type:"ClickAnimate", data:wob}, ver, 'insert_widget');

  //killeverythingpastthis
  var imgCon2 = $("#loader2");
  var image2 = new Sprite({id:43, framecount:1, src:"assets/item/w_CONSUB_lightstrand_2.png", width:70, height:70, loop:false});

  //TODO: this should all be internal to Sprite
  if (image2.init()) {
    image2.setClass("centerHV");
    image2.appendTo(imgCon2);
    image2.container.click(function(){image2.click()});
    image2.start();
  } else {
    console.error("failed to load sprite");
  }
  //widget attachment
  var ca2 = new ControllerSubject({
    controlType:"toggle",
    name:"toggle",
    animationOnInit:"toggle",
    frameset:[0,1]
  }).attach(image2);  //inline coding for the win...




  var imgCon3 = $("#loader3");
  var image3 = new Sprite({id:44, framecount:1, src:"assets/item/w_CONSUB_lightstrand_5.png", width:100, height:60, loop:false});

  //TODO: this should all be internal to Sprite
  if (image3.init()) {
    image3.setClass("centerHV");
    image3.appendTo(imgCon3);
    image3.container.click(function(){image3.click()});
    image3.start();
  } else {
    console.error("failed to load sprite");
  }
  //widget attachment
  var ca3 = new ControllerSubject({
    controlType:'toggle',
    name:'toggle',
    animationOnInit:"toggle",
    frameset:[0,1]
  }).attach(image3);  //inline coding for the win...

}
function ver(r) {console.log(r)};






function createCARecord() {
  var wob = {
    name:$("#caName").val(),
    loops:$("#widgetLoops").val(),
    frameset:getRangeArray($("#widgetFrameset").val())
  }
  aQuery({type:"ClickAnimate", data:wob}, ver, 'insert_widget');
}

function createConRecord() {
  var kf = $("#con_keyframes").val().split(',');
  for (var i in kf) kf[i] = kf[i]*1; //convert to ints
  var wob = {
    name:$("#con_name").val(),
    controlType:'toggle',
    loops:$("#con_loops").val(),
    frameset:getRangeArray($("#con_frameset").val()),
    keyframes:kf,
    sound_loop:$("#sound_loop").val(),
    sound_click:$("#sound_click").val(),
    sound_keyframe:$("#sound_keyframe").val()
  }
  aQuery({type:"Controller", data:wob}, ver, 'insert_widget');
}

function createConSubRecord() {
  var wob = {
    name:'toggle',
    controlType:'toggle',
    animationOnInit:"toggle",
    frameset:[0,1]
  }
  aQuery({type:"ControllerSubject", data:wob}, ver, 'insert_widget');
}


function createToggleSwitchRecord() {
  var wob = {
    name:'ToggleSwitch',
    controlType:'switch',
    animationOnInit:"toggle",
    frameset:[0,1]
  }
  aQuery({type:"ToggleSwitch", data:wob}, ver, 'insert_widget');
}

function createParallaxRecord() {

}



</script>
<style>



</style>

</head>
<body class="site">
<?php echo $alertPanes; ?>


  <main class="site_content"><center>
    <?php if (isset($_SESSION['player_id'])) : ?>
      <div class="pt_justifier">
        <div class="player_tab" onclick="showPlayerMenu();" title="Log Out">Log Out</div>
      </div>
    <?php endif; ?>
    <div id="gameFrame" class="game_frame content">

      <?php echo (isset($_SESSION['player_id'])) ? $gameHeader : $simpleHeader; ?>
      <div class="static_content dynamic">
        <br />
        <div style="width:100%; text-align:left;">
          Background Colour:
          <button style="background-color:black; width:50px; height:20px;" onclick="changeBackgroundColor('black')"></button>
          <button style="background-color:gray; width:50px; height:20px;" onclick="changeBackgroundColor('gray')"></button>
          <button style="background-color:silver; width:50px; height:20px;" onclick="changeBackgroundColor('silver')"></button>
          <button style="background-color:white; width:50px; height:20px;" onclick="changeBackgroundColor('white')"></button>
        </div>

        <button onclick="loadSprite()">Load Spritesheet</button>
        <br />Just hit "Load Spritesheet" again to clear it all out and test a new one.<br />
        <div id="headStuff"></div>
        <!-- <button onclick="start();">Start the Party!</button><button onclick="stop();">Call it a Night</button> -->
        <div id="main" class="landing_lower" style="display:inline-block;">


          <div id="effect_1"></div>

          <div style="display:inline-block">

            <div id="fxTarget" style="position:relative; left:-15px; height:430px; width:1126px; overflow:hidden; border:1px solid black; background-color:black;">

            </div>
          </div>

        </div>
      </div>
    </div>
    <div id="div2" style="height:300px; width:1126px; background-color:rgba(255,255,255,.7); display:inline-block;">
      Just an area to play in real quick<br />
      <!-- <img src="assets/site/pixel.png" onload="this.onload=null; this.src=getRandomImage();" /> -->
      <div id="loader" style="position:relative; height:250px; width:160px; z-index:50000; display:inline-block;"></div>
      <div id="loader2" style="position:relative; height:250px; width:160px; z-index:50000; display:inline-block;"></div>
      <div id="loader3" style="position:relative; height:250px; width:160px; z-index:50000; display:inline-block;"></div>

      <div id="widgetCreator" style="position:relative; height:100px; width:100%; display:inline-block; text-align:left;">
        Loops: <input type="number" id="widgetLoops" /><br />
        Frameset: <input type="text" id="widgetFrameset" /><br />
        <button type="button" onclick="createCARecord()">Create ClickAnimate Record</button>
      </div>

      <div id="controllerCreator" style="position:relative; height:100px; width:100%; display:inline-block; text-align:left;">
        Name: <input type="text" id="con_name" /><br />
        Loops: <input type="number" id="con_loops" /><br />
        Frameset: <input type="text" id="con_frameset" /><br />
        Keyframes: <input type="text" id="con_keyframes" /><br />
        <strong>Sounds:</strong><br />
        Loop: <input type="text" id="sound_loop" /><br />
        Click: <input type="text" id="sound_click" /><br />
        Keyframe: <input type="text" id="sound_keyframe" /><br />
        <button type="button" onclick="createConRecord()">Create Controller Record</button>
      </div>
      <br />
      <div>
        <button type="button" onclick="createToggleSwitchRecord()">Create TS Record</button>
      </div>


      <div style="position:relative; display:inline-block; text-align:left; width:100%;border:2px ridge #ffa500; background-color:silver;padding:2px;">
        <h4>Parallax Record</h4>
        Parallax layers should be ordered from back to front, starting with 0, which will be the static backer.<br />
        So, para_0.png, para_1.png, para_2.png would be three parallax levels (two, really), where para_0.png would be the static background image.<br />
        Name: <input type="text" id="par_name" /> (visual identifier...just for reference)<br />
        Image Prefix: <input type="text" id="par_imagename" />(if the files are named p_file_1.png, p_file_2.png, etc, this should be 'p_file_')<br />
        Depth: <input type="number" id="par_depth" style="width:50px;" />(total number of layers, including background)<br />
        speed<br />
        Static Layers: <input type="text" id="par_static" placeholder="0,1,2[...etc.]" />(layers that won't move)<br />
        Foreground Layers: <input type="text" id="par_over" placeholder="0,1,2[...etc.]" />(layers in front of habby)<br />
        Direction: <select id="par_dir">
                    <option value="right" selected="selected">Right</option>
                    <option value="left">Left</option>
                  </select>
        <br />
        <button type="button" onclick="createParallaxRecord()">Create Parallax Record</button>


      </div>

      <!-- <div id="controllerSubjectCreator" style="position:relative; height:100px; width:100%; display:inline-block; text-align:left;">
        <button type="button" onclick="createConSubRecord()">Create ControllerSubject Record</button>
      </div> -->


    </div>
  </center></main>
  <?php echo $footer; ?>
</body>
</html>
