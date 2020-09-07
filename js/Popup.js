var pd_onClose = undefined;
var pd_callback = undefined;

function popDisplay(data, callback, onClose) {
  // console.log("PopDisplay", data);
  var title = data.title || '';
  var content = data.content || $("<br/>");
    if (typeof content == 'string') content = $("<div/>").html(content);
  var text = data.text || '';

  var cancelButtonText = data.cancelButtonText || 'Close';
  var confirmButtonText = data.confirmButtonText || 'Confirm';

  var showConfirm = data.showConfirm || false;
  var showCancel = data.showCancel || false;
  var maxWidth = data.maxWidth || 300;
  var maxHeight = data.maxHeight || 300;

  var contentWidth = data.contentWidth || 200;
  var contentHeight = data.contentHeight || 150;

  var subtitle = data.subtitle || "";
  var subtext = data.subtext || "";

  //TODO: set up the callback and functionality to replace SWAL

  if (onClose != undefined) pd_onClose = onClose;
  if (callback != undefined) pd_callback = callback;


  var titleBlock = $("<div/>", {
    id:"popTitle",
    style:"position:relative; width:100%; text-align:center; font-weight:bold; font-size:1.2em;"
  }).append(data.title);


  var contentDiv = $("<div/>", {
    id:"popContent",
    style:`position:relative; height:${contentHeight}px; width:${contentWidth}px;display:inline-block;`
  })
  content.appendTo(contentDiv);

  var textBlock = $("<div/>", {
    id:"popText",
    style:`position:relative; width:100%; max-width:calc(${contentWidth}px + 100px); text-align:left; color:black;`
  }).append(data.text);

  var subtextBlock = $("<div/>", {
    id:"popSubtext"
  }).append(subtext);

  var buttonBlock = $("<div/>", {
    id:"popButtonBlock"
  });
  var confButton = $("<button/>").on('click', confirmPopup).html(confirmButtonText);
  var cancButton = $("<button/>").on('click', closePopup).html(cancelButtonText);
  if (showConfirm) buttonBlock.append(confButton);
  if (showCancel)  buttonBlock.append(cancButton);

  var pp = $("#previewPane");
  showScreenMask();
  $("#utilityPane").on('click', closePopup);
  pp.addClass('centerH itemPreview');

  pp.append(titleBlock, subtitle);
  pp.append("<br />", contentDiv);
  pp.append(textBlock, subtext);
  pp.append(buttonBlock);
}

function confirmPopup() {
  if (pd_callback != undefined) { pd_callback(); pd_callback = undefined; pd_onClose = undefined; }
}

//global functions
function closePopup() {
  hideScreenMask();
  $("#utilityPane").off('click');
  $("#previewPane").empty();
  $("#previewPane").attr('style', '');
  $("#previewPane").removeClass();
  if (pd_onClose != undefined) { pd_onClose(); pd_onClose = undefined; pd_callback = undefined; }
}
