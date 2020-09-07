<?php
  require_once "overhead.php";

  if (isset($_SESSION['privileges'])) {
    if ($_SESSION['privileges'] < 8) {
      header("Location: home");
    }
  } else { //not authorized
    header("Location: home");
  }

  $pageAction = "default";
  if (isset($_GET["page"])) $pageAction = $_GET["page"];


  $conn = new mysqli($DBservername, $DBusername, $DBpassword, $dbname);
  if ($conn->connect_error) {
      die("OH NO!  Our database blowed up :(  " . $conn->connect_error);
  }

  $sir = $conn->query("SELECT * FROM siteoptions") or die($conn->error);
  $siteOptions = json_encode($sir->fetch_object());
  $conn->close();
?>

<!DOCTYPE html>
<html>
<head>
  <title>ADMIN</title>
  <script>var maintenanceInProgress = 0;</script>
  <?php echo $requiredHead; ?>
  <link rel="stylesheet" href="css/admin.css?v=<?php echo mktime(); ?>" type="text/css" />
  <?php
    includeJSDir('js/admin/');
    includeJSDir('js/widgets/');
  ?>
  <!-- <script src="js/garden/garden.js?v=<?php echo mktime(); ?>"></script> -->
  <script src="js/animateSprite.js?v=<?php echo mktime(); ?>"></script>
  <script src="js/Sprite.js?v=<?php echo mktime(); ?>"></script>
  <script src="js/Effect.js?v=<?php echo mktime(); ?>"></script>
  <script src="js/inventory.js?v=<?php echo mktime(); ?>"></script>
  <script src="js/Popup.js?v=<?php echo mktime(); ?>"></script>
  <script src="js/modules/MasterList.js?v=<?php echo mktime(); ?>"></script>

  <script src="plugs/tinymce/tinymce.min.js"></script>
  <script>
    var editor = null;
    var pageMask = null;

    var siteOptions = <?php echo $siteOptions; ?>;
    currentPage = "admin";


    $('document').ready(function() {
      <?php echo $onReady; ?>
      editor = $("#editorPane");
      pageMask = $("#pageMask");
      pageMask.hide();
      editor.hide();

      switch('<?php echo $pageAction; ?>') {
        case "manageItems":
          $("#searchField").on("keypress",function(e){if(e.keyCode==13){searchInventory();}});
          buildAdminSearchTools();
          $(".pdate").remove();

          paramQuery(cParams, loadCats);  //getting the categories for nav
          searchInventory();  //this loads the goodies
        break;
        case "news":
          $("#editNewsPane").hide();
          loadArchives(3);
        break;
        default:
          //load stats?
        break;
      }
    });

    function loadArchives(limit) {
      limit = (limit != undefined) ? limit : 3;
      paramQuery({select:['id','news_date','title'], table:"news", limit:limit, order:["id", "DESC"], dir:"DESC"}, displayArchives);
    }
    function displayArchives(r) {
      console.log(r);
      var pane = $("#newsArchive");
      pane.append("<strong>Most recent</strong><br />")
      var ul = $("<ul/>");
      for (var i=0; i<r.length; i++) {
        ul.append($("<li/>", {
          style:"cursor:pointer",
          title:"Edit Article",
          onclick:'editArticle(' + r[i].id + ')'
        }).html(r[i].news_date + ' : ' + r[i].title));
      }
      pane.append(ul);
    }
    function editArticle(id) {
      paramQuery({select:["*"], table:"news", where:"id = " + id,}, displayArticle);
    }
    function displayArticle(r) {
      var article = r[0];
      $("#newsId").val(article.id);
      $("#newsText").html(article.entry);
      $("#newsText").val(article.entry);  //set for tinyMCE
      $("#title").val(article.title);
      $("#author").val(article.author);
      openNewsEditor();
    }

  </script>

</head>

<body class="site">
  <?php echo $alertPanes; ?>
  <div id="pageMask" class="page_mask"></div>
  <div id="editorPane" class="editor_pane centerHV"></div>

  <main class="site_content">
  <center>
    <div id="adminHead" class="admin_frame">
      <button class="navButton" onclick="window.location='home';">BittyPals Home</button>
      <button class="navButton" onclick="window.location='admin.php';">Admin Home</button>
      <button class="navButton" onclick="window.location='admin.php?page=manageItems';">Items</button>
      <button class="navButton" onclick="window.location='admin.php?page=managePlayer';">Players</button>
      <button class="navButton" onclick="window.location='admin.php?page=manageTrophies';">Trophies</button>
      <button class="navButton" onclick="window.location='admin.php?page=manageGarden';">Garden</button>
      <button class="navButton" onclick="window.location='admin.php?page=manageStore';">Store</button>
      <button class="navButton" onclick="showMonthlyManager();">Monthly</button>
      <button class="navButton" onclick="window.location='admin.php?page=manageEvents';">Events</button>
      <button class="navButton" onclick="window.location='admin.php?page=news';">News</button>
      <button class="navButton" onclick="window.location='admin.php?page=faq';">FAQ</button>
      <button class="navButton" onclick="window.location='admin.php?page=spinner';">Spinner Prizes</button>
      <button class="navButton" onclick="window.location='admin.php?page=maint';">Schedule Maintenance</button>
      <?php if ($_SESSION['privileges'] == 9) : ?>
        <button class="navButton" onclick="showExcelPane()" title="Spreadsheet reports for items or players">Generate Report</button>
        <!-- <button class="navButton" onclick="showFlintPane()" title="Mine">Flint's Stuff (no touchy)</button> -->
      <?php endif; ?>
      <button class="navButton" onclick="window.location='admin.php?page=macro';">Mass Functions</button>
      <button class="navButton" onclick="window.location='admin.php?page=collectible';">Creator Plushies</button>
      <button class="navButton" onclick="showBGAdmin()">Change Site Background</button>
    </div>

      <?php if ($pageAction == "manageItems") : ?>
        <div id="adminSecond" class="admin_frame">
          <button class="navButton" onclick="showItemEditor();">Add Item</button>
          <button class="navButton" onclick="window.location = 'admin.php?page=createWidget';">Add Widget Record</button>
          <!-- <button class="navButton" onclick="showEffectEditor();">Add Effect</button> -->
          <button class="navButton" onclick="openCategoryManager();">Manage Categories</button>
          <button class="navButton" onclick="openReleaseManager();">Manage Releases</button>
        </div>
      <?php endif; if ($pageAction == "news") : ?>
        <div id="adminSecond" class="admin_frame">
          <button class="navButton" onclick="loadArchives();">Load Archives</button>
          <button class="navButton" onclick="openNewsEditor();">Update News</button>
        </div>
      <?php endif; if ($pageAction == "managePlayer") : ?>
        <div id="adminSecond" class="admin_frame">
          <br />
          <strong>Search: </strong><input type="text" id="pSearch" placeholder="username, email, or ID" onkeydown = "if (event.keyCode == 13) document.getElementById('pSearchButton').click()" />
            <button type="button" id="pSearchButton" onclick="searchPlayers()">Make it so</button>
            <button type="button" id="pSearchReset" onclick="resetPlayerSearch()">Reset</button>
        </div>
      <?php endif; if ($pageAction == "manageTrophies") : ?>
        <div id="adminSecond" class="admin_frame">
          <button class="navButton" onclick="showTrophyEditor();">Add Trophy</button>
        </div>

      <?php endif; if ($pageAction == "manageGarden") : ?>
        <div id="adminSecond" class="admin_frame">
          <button class="navButton" onclick="showPlantEditor();">Add Plant</button>
          <button class="navButton" onclick="showPlants();">Edit Plants</button>
          &nbsp; &larr;&rarr; &nbsp;
          <button class="navButton" onclick="showSeedEditor();">Add Seed/Fertalizer</button>
          <button class="navButton" onclick="showSeeds();">Edit Seeds/Fertalizers</button>

        </div>
      <?php endif; if ($pageAction == "manageStore") : ?>
        <div id="adminSecond" class="admin_frame">
          <button class="navButton" onclick="showStoreEditor();">Add Store Item</button>
        </div>
      <?php endif; if ($pageAction == "collectible") : ?>
        <div id="adminSecond" class="admin_frame">
          <button class="navButton" onclick="newCollection();">Add Collection Set</button>
        </div>

      <?php endif; ?>



    <div id="adminBody" class="admin_frame content">                            <!-- DEFAULT ADMIN -->
      <!-- PAGE ACTION FORMS -->
      <?php if ($pageAction == "default") : ?>
        <div class="siteStats">
          <table style="width:100%;">
            <tr>
              <td id="popularItems" style="width:30%; font-size:.8em; vertical-align:top;">
                <?php
                  $conn = new mysqli($DBservername, $DBusername, $DBpassword, $dbname);
                  if ($conn->connect_error) { die("OH NO!  Our database blowed up :(  " . $conn->connect_error); }

                  $dpr = $conn->query("SELECT count(DISTINCT ip) AS dist, count(ip) as tot FROM player") or die($conn->error);
                  $players = $dpr->fetch_object();
                  echo "<strong>Players:</strong> $players->tot ($players->dist unique)<br /><br />";

                  echo "<strong>Most popular Gold items:</strong><br /><ul style='margin-top:0px;'>";
                  $mpir = $conn->query("SELECT name, gold, sold FROM item WHERE gold != 0 ORDER BY sold DESC LIMIT 10") or die($conn->error);
                  while($mpi = $mpir->fetch_object()) {
                    $gv = $mpi->gold * $mpi->sold;
                    echo "<li>$mpi->name ($mpi->sold sold) = <strong>$gv</strong><img src='assets/site/coin-gold.png' /></li>";
                  }
                  echo "</ul>";

                  echo "<strong>Most popular Silver items:</strong><br /><ul style='margin-top:0px;'>";
                  $mpir = $conn->query("SELECT name, silver, sold FROM item WHERE silver != 0 ORDER BY sold DESC LIMIT 10") or die($conn->error);
                  while($mpi = $mpir->fetch_object()) {
                    $sv = $mpi->silver * $mpi->sold;
                    echo "<li>$mpi->name ($mpi->sold sold) = <strong>$sv</strong><img src='assets/site/coin-silver.png' /></li>";
                  }
                  echo "</ul>";
                ?>
              </td>  <!--close popularItems -->
              <td style="vertical-align:top; padding:10px; width:70%; border-left:2px ridge #ffa500;">
                <center style="font-weight:bold; font-size:1.5em;">Money Stuffs</center>
                <table id="recordList"></table>

              </td>
            </tr>
          </table>

        </div> <!-- close siteStats -->

        <?php $conn->close(); ?>
        <script>fetchTransactionHistory();</script>

      <?php endif; if ($pageAction == 'macro') : ?>                               <!-- MACRO FUNCTIONS -->
        <div class="section_header">Mass Functions</div>
        <button type="button" onclick="openGiftDialog('sendMassGift')">Send Mass Gift</button>
        <button type="button" onclick="openTrophyDialog()">Send Mass Trophy</button>

      <?php endif; if ($pageAction == 'collectible') : ?>                         <!-- CREATOR PLUSHIES/COLLECTIBLES -->
        <div class="section_header">Creator Plushies/Collectibles</div>
        <div id="collectionDisplay" style="width:98%; padding:4px;"></div>
        <?php
          $conn = new mysqli($DBservername, $DBusername, $DBpassword, $dbname);
          if ($conn->connect_error) { die("OH NO!  Our database blowed up :(  " . $conn->connect_error); }
          // $r = $conn->query("SELECT collection.*, t.src, t.name, t.id AS tid FROM collection INNER JOIN trophy t ON collection.trophy = t.id") or die($conn->error);
          $r = $conn->query("SELECT * FROM collection ORDER BY id DESC") or die($conn->error);
          $collections = [];
          while($c = $r->fetch_object()) {
            $t = $conn->query("SELECT * FROM trophy WHERE id = $c->trophy") or die($conn->error);
            if ($t->num_rows > 0) $c->trophyData = $t->fetch_object();
            $it = $conn->query("SELECT id, src, name FROM item WHERE id IN($c->items)") or die($conn->error);
            if ($it->num_rows > 0) {
              $c->itemData = [];
              while($ii = $it->fetch_object()) $c->itemData[] = $ii;
            }
            $collections[] = $c;
          }
          @$conn->close();
        ?>
        <script>
          var collections = <?php echo json_encode($collections); ?>;
          getCollectionDisplay(collections, $("#collectionDisplay"));
        </script>



      <?php endif; if ($pageAction == 'maint') : ?>                               <!-- MAINTENANCE -->
        <div class="section_header">Schedule Maintenance</div>
        <?php
          $conn = new mysqli($DBservername, $DBusername, $DBpassword, $dbname);
          if ($conn->connect_error) { die("OH NO!  Our database blowed up :(  " . $conn->connect_error); }
          $r = $conn->query("SELECT maint_start, maint_end, maintenance FROM siteoptions") or die($conn->error);
          $m = $r->fetch_object();
          @$conn->close();
        ?>

        <strong>Maintenance Active:</strong> <input type="checkbox" id="maintenance" name="maintenance" value="1" disabled="disabled" /><br />
        <div id="mStart" style="position:relative;display:inline-block;">Start: </div>
        <div id="mEnd" style="position:relative;display:inline-block;">End: </div><br />
        <br />
        <button type="button" onclick="activateMaintenance()">Activate/Update</button>
        <button type="button" onclick="deactivateMaintenance()">Deactivate</button>
        <hr />

        <script>
          var mStartDate = $("<input/>", { id:"maint_start", type:"text", name:"maint_start", class:"input_text", value:"<?php echo $m->maint_start; ?>" });
          mStartDate.datepicker({dateFormat:"mm/dd/yy"});
          mStartDate.datepicker("setDate", new Date('<?php echo $m->maint_start; ?>'));
          $("#mStart").append(mStartDate);

          var mEndDate = $("<input/>", { id:"maint_end", type:"text", name:"maint_end", class:"input_text", value:"<?php echo $m->maint_end; ?>" });
          mEndDate.datepicker({dateFormat:"mm/dd/yy"});
          mEndDate.datepicker("setDate", new Date('<?php echo $m->maint_end; ?>'));
          $("#mEnd").append(mEndDate);

          if ('<?php echo $m->maintenance; ?>' == '1') {
            $("#maintenance").prop('checked', true);
          }
        </script>
      <?php endif; if ($pageAction == 'faq') : ?>                               <!-- FAQ -->
        <div class="section_header">Frequently Asked Questions</div>
        (click in the answer box to edit the FAQ)
        <hr />
        <div style="text-align:left; padding:5px;">
          <style>
            .question {
              height:20px;
              width:800px;
              font-weight:bold;
              resize:none;
            }
            .answer {
              width:800px;
              border:1px solid black;
              padding:5px;
            }
          </style>
          <script>

            initEditor("new");
            function initEditor(id) {
              var ta = $("#faqa"+id).replaceWith($("<textarea/>", {id:"faqa"+id, name:"answer"}).html($("#faqa"+id).html()));

              tinymce.remove("#faqa"+id);
              tinymce.init({
                selector: '#faqa' + id,
                allow_script_urls:true,
                menubar: 'edit insert format table tools',
                plugins: 'autolink link textcolor colorpicker hr paste searchreplace tabfocus preview autoresize',
                toolbar: 'searchreplace | forecolor bold italic underline strikethrough | formatselect, fontselect, fontsizeselect, bullist, numlist',
                branding: false,
                height:100,
                width:800,
                init_instance_callback : function() {
                  if (id == "new") {
                    toggleNew();
                  } else {
                    //add the submit button to the form
                    console.log("adding submit")
                    $("<button/>",{class:"faqsubmit", type:"submit"}).html("Save Changes").insertAfter($("#faqa"+id));
                  }
                }
              });
              $('#faqa' + id).unbind('focus');
            }
            function closeEditor(id) {
              tinymce.remove('#faqa' + id);
            }


            function toggleNew() {
              $("#newfaq").toggle();
            }

          </script>
          <strong onclick="toggleNew()" style="cursor:pointer;">Click here for new FAQ</strong><br />
          <div id="newfaq">
            <form method="post" action="adminFunctions.php?action=savefaq" class=".faqForm">
              <input type="hidden" name="id" value="new" />
              <input type="text" name="question" class="question" placeholder="Enter the question here" />
              <textarea id="faqanew" name="answer"></textarea>
              <button class="faqsubmit" id="new" type="submit">Submit New FAQ</button>
            </form>
          </div>
          <hr /><hr />

          <?php
            $conn = new mysqli($DBservername, $DBusername, $DBpassword, $dbname);
            if ($conn->connect_error) { die("OH NO!  Our database blowed up :(  " . $conn->connect_error); }
            $r = $conn->query("SELECT * FROM faq") or die($conn->error);
            while($f = $r->fetch_object()) {
              echo '<hr />';
              echo '<form id="faqf'.$f->id.'" method="post" action="adminFunctions.php?action=savefaq" class=".faqForm">';
              echo '<input type="hidden" name="fid" value="'.$f->id.'" />';
              echo '<input type="text" name="question" class="question" placeholder="Enter the question here" value="'.$f->question.'" />';
              echo '<br /><div class="answer" id="faqa'.$f->id.'" onclick="initEditor('.$f->id.')">'.$f->answer.'</div></form><br />';
            }
            $conn->close();
          ?>
          <hr />

        </div>


      <?php endif; if ($pageAction == "manageItems") : ?>                       <!-- ITEM MANAGEMENT -->

        <script>

        </script>
        <div id="inventoryContent">
          <div class="section_header">Items</div>
          <div id="lowerTitle"></div>
          <table style="width:100%; border-collapse:collapse;"><tr>
            <td id="inventoryNav" class="inventory_nav" rowspan="3">
              <?php echo $inventorySearch; ?>
            </td>
            <td style="border-top:1px solid black;"><?php echo $breadCrumb; ?></td>
            <tr><td id="inventoryList" class="inventory_list">
              <ul id="itemBlocks"></ul>
            </td></tr>
            <tr><td style="border-top:1px solid black;"><?php echo $breadCrumb; ?></td></tr>
          </table>
        </div>



      <?php endif; if ($pageAction == "createWidget") : ?>                       <!-- WIDGET MANAGEMENT -->

        <script>

        </script>
        <div id="inventoryContent">
          <div class="section_header">Widgets</div><hr />
          <div id="lowerTitle">
            Select Widget Type<br />
            <button type="button" onclick="getWidgetForm('parallax');">Parallax</button>
            <button type="button" onclick="getWidgetForm('controller');">Controller</button>
            <button type="button" onclick="getWidgetForm('clickAnimate');">Click Animate</button>
          </div>
          <br />
          <div id="widgetSection">

          </div>
        </div>


      <?php endif; if ($pageAction == "managePlayer") : ?>                      <!-- PLAYER MANAGEMENT -->

        <div class="breadcrumb" id="bcDiv">Page:  </div>
        <table class="record_table" id="playerTable">
          <th>ID</th><th>Username</th><th>Email</th><th>Join Date</th><th>Last Login</th><th>Actions</th>
        </table>
        <script>searchPlayers();</script>


      <?php endif; if ($pageAction == "manageTrophies") : ?>                    <!-- TROPHIES -->
        <script>
          initTrophyManagement();
        </script>
        <div id="trophyContent">
          <div class="section_header">Trophies</div>
          <div id="lowerTitle"></div>
          <table style="width:100%; border-collapse:collapse;"><tr>
            <tr><td id="trophyList" class="trophy_list">
              <ul id="trophyBlocks"></ul>
            </td></tr>
          </table>
        </div>


      <?php endif; if ($pageAction == "manageGarden") : ?>                    <!-- PLANTS -->
        <script>
          showPlants();
        </script>
        <div id="plantContent">
          <div id="adminTitle" class="section_header">Plants</div>
          <div id="lowerTitle"></div>
          <table style="width:100%; border-collapse:collapse;"><tr>
            <tr><td id="gardenList" class="trophy_list">
              <ul id="gardenBlocks"></ul>
            </td></tr>
          </table>
        </div>

      <?php endif; if ($pageAction == "manageStore") : ?>                    <!-- GARDEN STORE -->
        <script>
          showGardenStore();
        </script>
        <div id="storeContent">
          <div id="adminTitle" class="section_header">Store Entries</div>
          <div id="lowerTitle"></div>
          <table style="width:100%; border-collapse:collapse;"><tr>
            <tr><td id="storeList" class="trophy_list">
              <ul id="storeBlocks"></ul>
            </td></tr>
          </table>
        </div>

      <?php endif; if ($pageAction == "manageEvents") : ?>                    <!-- EVENTS -->
        <script>
          initCurrentModules();
        </script>
        <div id="eventContent">
          <div class="section_header">Events</div>
          <div id="lowerTitle"></div>

          <div id="eventAdminContent" style="text-align:left;">
            <span style="color:darkblue;">
              Hokay...so this was built at prototype speed, so there's probably a little wonkiness here.  Lemme explain a few things so that it might make a little bit of sense.<br />
              The "Name" field is the name that will show up in the Event pane in the player habbies.<br />
              The "Items" field is a multi-select to add the items that will be generated for the hunt.  To get those items onto the list you'll need to add "itemfind" to the keywords in the item management.  Hold down Ctrl and click to select multiple items.<br />
              The "Description" field will show up in the habby pages, so I suggest trying to keep it somewhat brief.<br />
              The "Prizes" section is another multi-select.  Add "prize" to the keyword section in the item manager to get them onto that list.<br />
              The "Trophy" is just a dropdown to select which trophy will be given out as a prize.<br /><br />
              This will all likely get a major overhaul down the road when I get some more time to rebuild it.
            </span>
          </div>


        </div>


      <?php endif; if ($pageAction == "news") : ?>                              <!-- NEWS -->
          <span style="font-size:1.3em;">News</span>
          <div id="newsArchive" style="width:100%;text-align:left;" /></div>

          <div id="editNewsPane">
            <form method="post" id="newsForm" action="adminFunctions.php?action=newsEntry" style="text-align:left;">
              Author: <input type="text" name="author" id="author" style="margin-right:20px;" value="" />
              Title: <input type="text" name="title" id="title" style="width:400px; margin-right:20px;" value="" />
              <textarea id="newsText" name="entry"></textarea>
              <input type="hidden" id="newsId" name="id" value="0" />
              <input type="submit" id="newsSubmit" value="Update News" />
              <button id="cancelNewsButton">Cancel</button>
            </form>
          </div>

      <?php endif; if ($pageAction == "spinner") : ?>                           <!-- SPINNER -->
        <style>
          #sw_rows {
            text-align: left;
            padding-left:20px;
          }
          #sw_rows input { margin-right:20px; }
          .spinner_row {
            position:relative;
            display:inline;
            left:25px;
          }
        </style>
        <span style="font-size:1.3em;">Chance Wheel</span><br />
        Okay, this has been rebuilt, and you shouldn't have any more issues with it.  Hopefully a little easier to put items on the wheel, as well.
        <br />For reference, the rows numbered in <span style="color:red">red</span> are the top, bottom, and sides of the spinner (bottom is 9).
        <div>
          Wheel Image: <input type="text" style="width:250px;" id="sw_background" value="" /><br />
        <div/>
        <table id="spinnerTable">
          <tr>
            <th>&nbsp;</th>
            <th>Title</th>
            <th>Description</th>
            <th>Image</th>
            <th>Type</th>
            <th>Value</th>
          </tr>
        </table>
        <br />
        <button type="button" onclick="saveSpinnerValues()">Save</button>

        <script>
          fetchSpinnerAdmin($("#spinnerTable"));
        </script>


      <?php endif; if ($pageAction == "somethingElse") : ?>                     <!-- SOMETHING ELSE -->
        This will have the next thing I think of...


      <?php endif; ?>
    </div>


  </center>
  </main>
  <?php echo $footer; ?>
</body>
</html>
