var widgetForms = {};

widgetForms.parallax =
  `<div id="widgetForm" class="widget_form">
  <h4>Parallax Habby Widget</h4>

  <span style="color:red">
  Under Construction - do not use<br />
  TODO: multi-file upload
  </span><br/><br />

  Parallax layers should be ordered from back to front, starting with 0, which will be the static backer.<br />
  So, para_0.png, para_1.png, para_2.png, para_3.png would be two (likely) moving layers, and para_0.png would be the static background image and para_3.png would be the static stage to put the bitties on so that the ground wasn't sliding under their feet.<br />

  <br /><input name="parallaxFile[]" type="file" multiple="multiple" id="parallaxFile"><br /><br />
  <div id="uploadsts"></div>

  Name: <input type="text" id="par_name" /> (visual identifier...just for reference)<br />
  Image Prefix: <input type="text" id="par_imageName" />(if the files are named p_file_0.png, p_file_1.png, p_file_2.png, etc, this should be 'p_file_')<br />
  Depth: <input type="number" id="par_depth" style="width:50px;" value="1" />(total number of layers, including background)<br />


  Speed: <select id="par_speed">
          <option value=".01">Very Very Slow</option>
          <option value=".05">Very Slow</option>
          <option value=".1">Slow</option>
          <option value=".5">Normal</option>
          <option value="1">Fast</option>
          <option value="3">Super Fast</option>
         </select>
  <br />


  Static Layers: <input type="text" id="par_static" placeholder="0,1,2[...etc.]" />(layers that won't move)<br />
  Foreground Layers: <input type="text" id="par_over" placeholder="0,1,2[...etc.]" />(layers in front of habby)<br />
  Direction: <select id="par_dir">
              <option value="right" selected="selected">Right</option>
              <option value="left">Left</option>
            </select>
  <br />
  <button type="button" onclick="previewParallax()">Preview</button>
  <!--<button type="button" onclick="createParallaxRecord()">Create Parallax</button>-->
  <button type="button" id="uploadFiles">Save New Parallax</button>

  <br />
  <div id="habitat" class="habitat">
    <div id="innerHab" style="position:absolute; top:0px; left:0px;">
      <div id="habBackground"></div>
    </div>
    <div id="habOverlay"></div>
  </div>
  <style>
  .habitat {
    position:relative;
    top:0px;
    left:0px;
    height:430px;
    width:1126px;
    overflow:hidden;
    background-position: center top;
    background-size: contain;
    border:1px solid blue;
  }
  #habBackground {
    position:absolute;
    top:0px;
    left:0px;
    height:430px;
    width:1126px;
    z-index:0;
    pointer-events: none;
    background-color:white;
  }
  #habOverlay {
    position:absolute;
    top:0px;
    left:0px;
    height:430px;
    width:1126px;
    z-index:9999;
    overflow:hidden;
    pointer-events:none;
  }</style>


</div>
<script>initParallaxPreview();</script>
`;

widgetForms.controller =
  `<div id="widgetForm" class="widget_form">
  <h4>Controller Item Widget</h4>
  Name: <input type="text" id="con_name" placeholder="North Pole Dancer" title="Unique name for the Widget\nSelector in the item editor" /><br />
  Loops: <input type="number" id="con_loops" placeholder="2" title="Number of times the below frameset will play" /><br />
  Frameset: <input type="text" id="con_frameset" placeholder="i.e.: 7-24" title="The frames that will play when the player clicks" /><br />
  Keyframes: <input type="text" id="con_keyframes" placeholder="7,8,9,17,18,19,22,23,24" /> These are the frames that will 'activate' any Subject items<br />
  <br /><strong>Sounds:</strong><br />
  (TODO: the admin for this is not wholly implemented.  Need to get a sound uploader built in)<br />
  Loop: <input type="text" id="sound_loop" /><br />
  Click: <input type="text" id="sound_click" /><br />
  Keyframe: <input type="text" id="sound_keyframe" /><br />
  <button type="button" onclick="createConRecord()">Create Controller Record</button>
</div>`;

widgetForms.clickAnimate =
  `<div id="widgetForm" class="widget_form">
  <h4>Click Animate Item</h4>
  Name: <input type="text" id="caName" placeholder="Dancing Puppy" title="Unique name for the Widget Selector\nin the item editor" /><br />
  Loops: <input type="number" id="widgetLoops" placeholder="2" title="Number of times the below frameset will play" /><br />
  Frameset: <input type="text" id="widgetFrameset" placeholder="13-24" title="The frames that will play when the player clicks" /><br />
  <button type="button" onclick="createCARecord()">Create ClickAnimate Record</button>
</div>`;



function getWidgetForm(type) {
  if (widgetForms[type] != undefined) {
    $("#widgetSection").empty();
    $("#widgetSection").append(widgetForms[type]);
  } else {
    console.error("Undefined Widget type:: ", type);
  }
}

function ver(r) {
  console.log(r)
};


////////////////////////////////////////////////////////////////////////////////CREATION METHODS
function createConRecord() {
  var kf = $("#con_keyframes").val().split(',');
  for (var i in kf) kf[i] = kf[i] * 1; //convert to ints
  var wob = {
    name: $("#con_name").val(),
    controlType: 'toggle',
    loops: $("#con_loops").val(),
    frameset: getRangeArray($("#con_frameset").val()),
    keyframes: kf,
    sound_loop: $("#sound_loop").val(),
    sound_click: $("#sound_click").val(),
    sound_keyframe: $("#sound_keyframe").val()
  }
  aQuery({
    type: "Controller",
    data: wob
  }, ver, 'insert_widget');
}


function createCARecord() {
  var wob = {
    name: $("#caName").val(),
    loops: $("#widgetLoops").val(),
    frameset: getRangeArray($("#widgetFrameset").val())
  }
  aQuery({
    type: "ClickAnimate",
    data: wob
  }, ver, 'insert_widget');
}


////////////////////////////////////////////////////////////////////////////////PARALLAX
function getParallaxObject() {
  var wob = {
    name: $("#par_name").val(),
    depth: $("#par_depth").val(),
    speed: $("#par_speed").val(),
    imageName: $("#par_imageName").val(),
    static: $("#par_static").val(),
    over: $("#par_over").val(),
    direction: $("#par_dir").val()

  }
  return wob;
}

function createParallaxRecord() {
  if (!confirm("Are you sure everything is set?")) return;
  var wob = getParallaxObject();
  aQuery({type:"Parallax", data:wob}, createParallaxItem, 'insert_widget');
}

var tempWidget = undefined;
var readers = [];

function previewParallax() {
  var wob = getParallaxObject();
  wob.isPreview = true;
  wob.readers = readers;

  tempWidget = getWidget(
    'ParallaxHabby', wob
  ).init($("#habBackground"));
}



function initParallaxPreview() {
  // Multiple images preview in browser
  var imagesPreview = function(input, target) {
    // console.log("imagesPreview");
    if (input.files) {
      var filesAmount = input.files.length;
      $("#par_depth").val(filesAmount);
      readers = [];

      for (i = 0; i < filesAmount; i++) {
        var reader = new FileReader();
        reader.fileName = input.files[i].name;
        readers.push(reader);
        //get the file prefix best guess
        var thenum = reader.fileName.replace( /^\D+/g, '');
        var baseName = reader.fileName.split(thenum)[0];
        $("#par_imageName").val(baseName);

        reader.onload = function(event) {
          var p_img = $("<img/>", {
            style: "position:absolute;"
          });
          p_img.attr('src', event.target.result).appendTo(target);
          // console.log(this);
        }

        reader.readAsDataURL(input.files[i]);
      }
    }

  };

  $('#parallaxFile').on('change', function() {
    imagesPreview(this, $("#habBackground"));
  });


  $('#uploadFiles').click(function() {
    if (!confirm("Are you sure that everything is set correctly?")) return;

    //TODO: validate fields before processing

    var fileList = $('#parallaxFile').prop("files");
    $('#uploadsts').html('');
    for (var i=0; i<fileList.length; i++) {
      $('#uploadsts').append('<p class="upload-page">' + fileList[i].name +
        '<span class="loading-prep" id="prog' + i + '"></span></p>');
      if (i == fileList.length - 1) {
        uploadajax(fileList.length - 1, 0);
      }
    }
  });
}



function uploadajax(ttl, cl) {
  var fileList = $('#parallaxFile').prop("files");
  $('#prog' + cl).removeClass('loading-prep').addClass('upload-image');

  var form_data = "";

  form_data = new FormData();
  form_data.append("upload_image", fileList[cl]);


  var request = $.ajax({
      url: "adminFunctions.php?action=parallax_upload",
      cache: false,
      contentType: false,
      processData: false,
      async: true,
      data: form_data,
      type: 'POST',
      xhr: function() {
        var xhr = $.ajaxSettings.xhr();
        if (xhr.upload) {
          xhr.upload.addEventListener('progress', function(event) {
            var percent = 0;
            if (event.lengthComputable) {
              percent = Math.ceil(event.loaded / event.total * 100);
            }
            $('#prog' + cl).text(" " + percent + '%')

          }, false);
        }
        return xhr;
      }
    })
    .done(function(res, status) {
      if (status == 'success') {
        percent = 0;
        $('#prog' + cl).text('');
        $('#prog' + cl).text(' -> Upload Success');
        if (cl < ttl) {
          uploadajax(ttl, cl + 1);
        } else {
          // alert('Done ');
          createParallaxRecord();
        }
      }
    })
    .fail(function(res) {
      alert('Upload Failed');
    });

}


function createParallaxItem(r) {
  var wid = r.wid;
  var wob = getParallaxObject();
  paramQuery({insert:'item', values:{name:wob.name, type:'habitat', release_date:"NOW", wid:wid, keywords:"parallax", categories:"", pack_list:"", instore:0, description:"Parallax,scrolling,habitat"}}, validateParallaxItem);
}

function validateParallaxItem(r) {
  console.log(r);
}
