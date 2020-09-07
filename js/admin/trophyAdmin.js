var trophyObjects = [];
var fauxTrophy = {id:"000", src:"", name:""};  //"blank" trophy object for creating new trophies.

function initTrophyManagement() {
  paramQuery({}, buildTrophies, 'admin_get_trophies');

}

function buildTrophies(ob) {
  console.log("Trophies", ob);
  $("#trophyBlocks").empty();
  for (var i = 0; i < ob.length; i++) {
    var trophy = ob[i];

    trophyObjects["trophy_" + trophy.id] = ob[i]; //put it into the data array for use
    var node = $("<li/>", { id:"trophy_" + trophy.id, class:"item_block gridItem" });
    var imgCon = $("<div/>", {class:"item_block_image_container center", id:"ibic_" + trophy.id});

    var image = $("<img />", {
      "src": trophy.src + "?v=" + Math.random(),
      "class": "item_block_image centerHV"
    });

    var iconBlock = $("<div />", {class:"icon_block"});
    imgCon.append(iconBlock);


    var info = $("<div/>").html(trophy.name + "<br />");
    var edit = $("<button/>").text("Edit");
        edit.attr({
          "onclick":"showTrophyEditor("+trophy.id+");",
          "class":"item_button"
        });
    var foo = $("<button/>").text("Foo?");
        foo.attr({
          "onclick":"alert('I does nothings?');",
          "class":"item_button"
        });
    var retire = $("<button/>").text("Delete");
        retire.attr({
          "onclick":"deleteTrophy("+trophy.id+");",
          "class":"item_button"
        });
    info.append(edit, foo, retire);
    imgCon.append(image);
    node.append(imgCon, info);
    $("#trophyBlocks").append(node);
  }
}



                                                                                //EDITOR
function showTrophyEditor(id) {
  console.log("showTrophyEditor()");
  pageMask.show();
  editor.show();
  var trophy = (id != undefined) ? trophyObjects["trophy_" + id] : fauxTrophy;  //data object or faux

  var imgCon = $("<div/>").attr({ "class": "item_block_image_container center", "id": "i_" + trophy.id });
  var image = $("<img />").attr({ "src": trophy.src, "class": "item_block_image centerHV", "id":"i_" + trophy.id + "_img" });
  imgCon.append(image);
  //create popup and do something cool...
  editor.append('<span class="edit_title centerH">Editing Trophy #'+trophy.id+'</span>');  //title
  editor.append('<button id="closeEditorButton" class="close_button" onclick="closeEditor();">X</button>');  //close button
  editor.append(imgCon);  //image container

  if (trophy.id == "000") {
    var imageUpload = $("<form/>", { id:"imageUpload", action:"", method:"post", enctype:"multipart/form-data"});
    imageUpload.append($("<input/>", { type:"file", name:"file", id:"file", required:"required"}));
    editor.append(imageUpload);
    initFileUpload();
  }

  var formBlock = $("<div/>", {id:"formBlock", "class":"form_block"});
  var form = $("<form/>", { id:"editorForm", action:'' });
      form.append($("<input/>", { type:"hidden", id:"form_type", value:"trophies"}));

      form.append("<br />Name: ");

      trophy.name = demystify(trophy.name);  //desanitize the name
      form.append($("<input/>", { id:"form_name", type:'text', placeholder:'I need a name!', name:'name', class:"input_text", value:trophy.name, style:'width:318px' }));

      form.append("<br />Image Path: ");
          var srcInput = $("<input/>", { id:"form_src", type:'text', placeholder:'Where am I?!', name:'src', class:"input_text", value:trophy.src, style:'width:270px' });
          form.append(srcInput);

      //description
      trophy.description = br2nl(demystify(trophy.description));  //desanitize the description
      form.append('<br /><br />Description:<br />');
          form.append($("<textarea/>",
            { id:"form_description", class:"input_textarea", style:"height:100px;", placeholder:"Feel free to leave this blank", name:"description" }).append(trophy.description));

      formBlock.append(form);

      //cancel button
      formBlock.append($("<button/>", { id:"cancelButton", onclick:"closeEditor();" }).html("Cancel"));
      formBlock.append($("<button/>", { id:"saveButton", onclick:"saveTrophyEditor("+id+");" }).html("Save Changes"));

      editor.append(formBlock);
      var errorMessage = $("<p/>", { id:"errorMessage", class:"error" });
      editor.append(errorMessage);
      errorMessage.hide();


      srcInput.change(function(e) { imageTarget = $(this).val(); });
      srcInput.on("input", function() { imageTarget = $(this).val(); });

}

function saveTrophyEditor(id) {
  $("#form_name").val(sanitize($("#form_name").val()));  //sanitize
  $("#form_description").val(sanitize(nl2br($("#form_description").val())));  //sanitize
  var x = $("#editorForm").serializeArray();

  // console.log(x);
  // return;

  if (id == undefined) {  //new Item
    processTrophyImage(x);
  } else {  //updating existing item
    paramQuery({"update":"trophy", "id":id, "values":x, "admin":true}, validateTrophySave);
  }
}

function deleteTrophy(id) {
  aQuery({id:id}, onDeleteTrophy, 'delete_trophy');
}

function onDeleteTrophy(r) {
  if (r != 'success') {
    console.error("Delete Trophy Failed:: ", r);
  } else {
    location.reload();
  }
}







                                                                                //IMAGE PROCESSING
function processTrophyImage(ob) {
  $.ajax({
    url: "adminFunctions.php?action=imageUpload&imageTarget=" + imageTarget,
    type: "POST",             // Type of request to be send, called as method
    data: new FormData(document.getElementById("imageUpload")), // Data sent to server, a set of key/value pairs (i.e. form fields and values)
    contentType: false,       // The content type used when sending data to the server.
    cache: false,             // To unable request pages to be cached
    processData:false,        // To send DOMDocument or non processed data file it is set to false
    // contentType: "application/json; charset=utf-8",
    success: function(data) {
      if (data == "success") {
        paramQuery({insert:"trophy", values:ob, admin:true}, validateTrophySave);
      } else { //give an error message
        console.error("this is an error?", data);
      }

    },
    error: function(error) {
      console.error(error);
    }
  });
}

function validateTrophySave(r) {
  console.log(r);
  if (r == 'success') { location.reload(); }
}
