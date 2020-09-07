//constructor and management classes for inventory, market, etc.


class ItemBlock {
  constructor(ob, type) {
    this._ob = ob;
    this.type = type || currentPage;

    this.inventoryIds = [];  //for inventory use only

    this.itemID = ob.id || ob.item.id;  //polymorphize this to handle other pages
    this.node = undefined;  //display block
    this.imageContainer = undefined;
    this.image = undefined;
    this.iconBlock = undefined;
    this.mask = undefined;

    this._name = '';

    //binding
    this.showPreview = (function(fn){this.preview(fn);}).bind(this);  //explicit binding to 'this' scope
    this.previewHeight = undefined;
    this.previewWidth = undefined;

    this.available = ob.available || 0;


    this.render(ob);
  }

  //getters/setters
  get display() { return this.node; }

  get name() { return this._name; }
  set name(v) { this._name = v.replace(/'/g, "\\'"); }

  render(ob) {
    //set up the cost
    this.costString = `<span style="font-size:1.4em; font-weight:bold; color:#008080;"><img src="assets/site/coin-`;  //for market and recyclotron use only
    this.costString += (ob.silver > 0) ? `silver.png" />${ob.silver}` : (ob.gold > 0) ? `gold.png" />${ob.gold}` : `gold.png" /> ??`;
    this.costString += "</span>";

    this.node = $("<li/>", {
      id:"inv_item_" + this.itemID,
      class:"item_block gridItem"
    });
    this.name = ob.name || ob.item.name;  //let the setter sanitize it

    this.imageContainer = $("<div/>", {
          class: "item_block_image_container",
          id: "ibic_" + this.itemID,
          // title: "Add this item to \nyour shopping bag!",
          style: "cursor:copy"
        });

    this.image = this.renderImage();




    //ICONS
    this.iconBlock = $("<div />", {class:"icon_block"});
    this.imageContainer.append(this.iconBlock);

    var palette = ob.palette || ob.item.palette;
    if (palette == 1) {
      var pIcon = $("<img />", {
        src: "assets/site/colourchange.png",
        class: "item_icon",
        title: "Has Colour Change"
      });
      this.iconBlock.append(pIcon);
    }
    //END ICONS



    var info = $("<div/>", {"style":"text-align:center; width:100%;"});


    var nameBlock = $("<div/>", {
      style:"width: 148px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; user-select:none;"
    }).html(`<strong title="${this.name}">${this.name}</strong>`);
    info.append(nameBlock);


    var prevButton = $("<div/>", { class:"previewButton", title:"Item Info" });
    prevButton.on('click', this.showPreview);


    this.mask = $("<div />", {
        class:"mask",
        id:`inv_item_${ob.item_id}_mask`,
        style:"position:absolute; border-radius:10px"
      });
    this.node.append(this.mask);
    if (this._ob.available > 0 || this.type == 'market' || this.type == 'admin' || this.type == 'cart') this.mask.hide();


    ////////////////////////////////////////////////////////////////////////////START PAGE CASING
    switch(this.type) {
      case "market":
        this.imageContainer.attr('onclick', `addItemToCart(${this.itemID}, '${this.name}')`);
        this.imageContainer.attr('title', "Add this item to \nyour shopping bag!");

        var costBlock = $("<div/>", {
          style:"position:relative; display:inline-block; float:left;"
        }).html(this.costString);
        info.append(costBlock);
        info.append(prevButton);
      break;
      case "habitat":
        this.imageContainer.attr('onclick', `addItemToHabitat(${ob.item_id})`);
        this.imageContainer.attr('title', "Add this item to \nyour habitat!");

        var countBlock = $("<div/>", {
          style:"position:relative; display:inline-block; font-size:1em; font-weight:bold; color:#008080"
        }).html(`<span id="inv_item_${ob.item_id}_available">${ob.available}</span>/${ob.matchCount || ob.tcount} Available`);


        info.append(countBlock);


        //other interactive buttons
        if (ob.item.interactive == 1) {
          var buttonText = (ob.item.on_activate == 'transmog') ? "Drink" : (ob.item.on_activate == "changeusername") ? "Use" : "Open";
          countBlock.append("<br />", $("<div/>", {
            title:"Click to interact with this item!",
            class:"gridItem",
            style:"background-color:#acc6ef; padding:2px 4px 2px 4px; border-radius:5px; cursor:pointer; margin-left:10px;",
            onclick:`itemInteraction('${ob.item_id}', '${ob.item.on_activate}', '${ob.item.src}')`
          }).html(buttonText));
        }
        if (ob.item.is_pack == 1) {
          countBlock.append("<br />", $("<div/>", {
            title:"Click to unpack this item!",
            class:"gridItem",
            style:"background-color:#acc6ef; padding:2px 4px 2px 4px; border-radius:5px; cursor:pointer; margin-left:10px; color:black;",
            onclick:`unpackItem('${ob.item_id}', '${ob.item.pack_list}', '${ob.item.src}')`
          }).html("Unpack Items"));
        }

        info.append(prevButton);
      break;
      case "gift":
        this.imageContainer.attr('onclick', `addItemToGift(${ob.item_id})`);
        this.imageContainer.attr('title', "Add this item to \nthe gift box!");

        var countBlock = $("<div/>", {
          style:"position:relative; display:inline-block; font-size:1em; font-weight:bold; color:#008080"
        }).html(`<span id="inv_item_${ob.item_id}_available">${ob.available}</span>/${ob.matchCount || ob.tcount} Available`);

        info.append(countBlock);
        info.append(prevButton);
        if (ob.transferable == 0) {
          this.mask.show();
          this.node.append('<div class="oWrapper" style="z-index:40000"><div class="overlay">CANNOT<br />TRANSFER</div>');
        }
      break;
      case "recycle":
        this.imageContainer.attr('onclick', `addItemToBin(${ob.item_id})`);
        this.imageContainer.attr('title', "Add this item to \nthe gift box!");

        var countBlock = $("<div/>", {
          style:"position:relative; display:inline-block; font-size:1em; font-weight:bold; color:#008080"
        }).html(`<span id="inv_item_${ob.item_id}_available">${ob.available}</span>/${ob.matchCount || ob.tcount} Available`);

        info.append(countBlock);
        info.append(prevButton);
        if (ob.transferable == 0) {
          this.mask.show();
          this.node.append('<div class="oWrapper" style="z-index:40000"><div class="overlay">CANNOT<br />RECYCLE</div>');
        }
      break;
      case "admin":
        this.imageContainer.on('click', this.showPreview);
        this.imageContainer.css('cursor', 'help');
        this.imageContainer.attr('title', "Preview Item");

        var edit = $("<button/>", {
          onclick:`showItemEditor(${ob.id})`,
          class:"item_button"
        }).text("Edit");
        var deleteBtn = $("<button/>", {
          onclick:`deleteItem(${ob.id})`,
          class:"item_button"
        }).text("Delete");

        info.append(edit, deleteBtn);
      break;
      case "cart":
        this.imageContainer.on('click', this.showPreview);
        this.imageContainer.css('cursor', 'help');
        this.imageContainer.attr('title', "Preview Item");
        this.node.css("height", "220px");
        var cartInfo = $("<div/>", {style:"position:relative; height:35px; width:100%; text-align:center; border-top:1px solid #acc6ef;"});
          cartInfo.append($("<button/>",{ onclick:`decrement(${ob.id})`, title:"Remove one of this item", style:"float:left;" }).html('&#x25BC;'));
          cartInfo.append($("<span/>", { id:`item_${ob.id}_count`, style:"font-size:1.5em; font-weight:bold; color:#008080;"}).html(ob.count));
          cartInfo.append($("<button/>",{ onclick:`increment(${ob.id})`, title:"Add another of this item", style:"float:right;" }).html('&#x25B2;'));

          var costBlock = $("<div/>", {
            style:"position:relative; display:inline-block; float:left; top:-10px;"
          }).html(this.costString + "/each");
        info.append(cartInfo, costBlock);
      break;
      default:
        console.error("I'm not even supposed to be here today...");
      break;
    }


    this.imageContainer.append(this.image);
    this.node.append(this.imageContainer);
    this.node.append(info);

  }

  renderImage(temp) {
    var image = undefined;
    // var tempCon = $("<div/>", {id:"previewPop"});
    var ob = (this._ob.src == undefined) ? this._ob.item : this._ob;
    var spriteID = (temp == true) ? "prev" : this.itemID;
    if (ob.is_sprite == 1) {
      this.previewHeight = ob.frame_height;
      this.previewWidth = ob.frame_width;
      image = new Sprite({id:spriteID, framecount:ob.frame_count, src:ob.src, width:ob.frame_width, height:ob.frame_height});
      if (image.init()) {
        image.setClass("centerHV");
        if (temp == undefined) {
          image.appendTo(this.imageContainer);
          image.max(140,140);
        }
        image.start();
      }
    } else if (ob.is_effect == 1) {
      image = (temp == true) ? $("<div/>",{id:'previewPop'}) : '';
      var target = (temp == true) ? 'previewPop' : `ibic_${this.itemID}`;
      if (temp == true) { this.previewHeight = 400; this.previewWidth = 600; }
      var cb = (temp == true) ? loadEffectPreviewLarge : loadEffectPreview;
      paramQuery({target:target, effectID:ob.effect_id}, cb, 'fetch_effect');

    } else if (ob.widgetData != undefined && ob.widgetData.type == 'Parallax') {
      // console.log("inventory:: parallax widget found: ", ob.widgetData);
      var imgID = (temp == true) ? `previewImage_${this.itemID}` : `ibi_${this.itemID}`;

      image = $("<div/>", { id:`pcon_${this.itemID}`, style:"position:absolute;" });
      var imageFore = $("<div />", { id:`pfore_${this.itemID}`, style:"position:absolute;" });

      this.imageContainer.append(image, imageFore);
      if (temp == true) { this.previewHeight = 305; this.previewWidth = 800; }

      var wdata = ob.widgetData.data;
      wdata.previewType = (temp == true) ? "large" : "small";
      this.widget = getWidget("ParallaxHabby", wdata).init(image, imageFore);


    } else {
      var imgID = (temp == true) ? `previewImage_${this.itemID}` : `ibi_${this.itemID}`;
      image = $("<img />", { id:imgID, "src": ob.src, "class": "item_block_image centerHV" });
      if (temp == true) {
        var imgBase = document.getElementById(`ibi_${this.itemID}`);
        this.previewHeight = imgBase.naturalHeight;
        this.previewWidth = imgBase.naturalWidth;
        if (this.previewWidth > 800) {
          var per = 800 / this.previewWidth;
          this.previewHeight = this.previewHeight*per;
          this.previewWidth = this.previewWidth*per;
        }
        image.removeClass('item_block_image centerHV');
        image.css('max-width', '800px');
      }
    }
    return image;
  }

  preview() {
    // console.log("Showing preview for ", this._ob);

    var imgClone = this.renderImage(true);
    if (this._ob.description == "") this._ob.description = "No Description";
    var desc = this._ob.description ||
      this._ob.item.description ||
      "No Description";

    // console.log("Image Clone", imgClone);

    var pw = this.previewWidth;
    var ph = this.previewHeight;
    popDisplay({
      title:this.name,
      subtitle:this.iconBlock.html(),
      content:imgClone,
      text:desc,
      // subtext:`<br/><strong>Keywords:</strong><br /><span style="font-size:.8em;">${this._ob.keywords}</span>`,
      contentHeight:ph,
      contentWidth:pw
    });
  }
}
