function createDonateButton() {
  getPPButton($("#donateAmt").val(), 'donation', 0, 'donateBtn');
}

//this is to generate the monthly support button
function createMonthlyButton() {
  getPPButton(5, 'monthly', 0, 'monthlyBtn');
}

function createCollectibleButton(total) {
  getPPButton(total, 'collectible', 0, 'collectibleButton');
}

function createStoreButton(total) {
  getPPButton(total, 'store', 0, 'storeButton');
}


var ppName = {
  gold: " Gold",
  donation: "Bitty-Pals Donation",
  monthly: "Bitty-Pals Monthly Supporter",
  collectible: "Bitty-Pals Limited Collectibles",
  store: "Bitty-Pals Store"
}
var ppDescription = {
  gold: " Bitty-Pals Gold Coins",
  donation: "Bitty-Pals Donation",
  monthly: "Bitty-Pals Monthly Supporter",
  collectible: "Bitty-Pals Limited Collectibles",
  store: "Bitty-Pals Store"
}



var tempType = undefined;

function getPPButton(amount, type, count, target) {
  var item = {};
  tempType = type;
  // item.name = (type == 'gold') ? count + " Gold" : (type == 'donation') ? "BittyPals Donation" : "Bitty-Pals Monthly Supporter";
  item.name = (type == 'gold') ? count + ppName[type] : ppName[type];
  // item.description = (type == 'gold') ? count + " BittyPals Gold Coins" : (type == 'donation') ? "BittyPals Donation" : "Bitty-Pals Monthly Supporter";
  item.description = (type == 'gold') ? count + ppDescription[type] : ppDescription[type];
  item.price = amount;
  item.currency = "USD";
  item.quantity = 1;

  paypal.Button.render({
    env: 'sandbox',
    // env: 'production',
    client: {
      sandbox: 'AfTqfUH3SUcIBriRWdDckYf3AqJiUcsBafrOGjakyC2H4FWSSnyw_twuB1r88OAl0yjZk3tvCHEHMvF6',
      production: 'AX7Dy3w4aVUAx02QGBzv_cF8WZqh63M8HM2OYbGXb99PKKvSdYA85JEOzZS5DCWEnLfWsnYdJmWoKUHo'
    },
    commit: true, // Show a 'Pay Now' button
      payment: function(data, actions) {
        // Set up the payment here
        return actions.payment.create({
          transactions: [
            {
              amount: { total: amount, currency: 'USD' },
              item_list: { items: [ item ] }
            }
          ]
        }, { input_fields: { no_shipping: 1 }
        });
      },
      onAuthorize: function(data, actions) {
          // Execute the payment here
        return actions.payment.execute().then(function(payment) {
          // console.log("payment thing", payment);
          if (payment.state == 'approved') {
            var item = payment.transactions[0].item_list.items[0];
            var sale = payment.transactions[0].related_resources[0].sale;
            // var type = (item.name == "BittyPals Donation") ? "donation" : (item.name == "Bitty-Pals Monthly Supporter") ? "monthly" : "gold";
            var type = tempType;
            if (type == "gold") {
              //add gold to the player
              var gVal = item.name.split(" ")[0];
              givePlayerMoney(playerID, {gold:Number(gVal)}, false);
              sounds.lotsocoins.play();
            }
            var v = {invoice:"'"+sale.id+"'", amount:sale.amount.total, date:'NOW', pid:playerID, type:type};
            commitSerialTransaction(playerID, sale.id, sale.amount.total);
            paramQuery({insert:"transaction_history", values:v}, validateTransactionRecord);
            paramQuery({update:'player', id:playerID, values:{last_payment:"NOW"}}, validateLastPayment);

            var ttl = "";
            var txt = "";
            var cbt = "";
            // var ttl = (gVal != undefined) ? "Purchase Complete!" : "Thank you so much for your donation!";
            // var txt = (gVal != undefined) ? gVal + " Gold Coins have been added to your Bitty Bank" : "We really appreciate your support!";
            // var cbt = (gVal != undefined) ? "Yay! Now lemme go buy stuff!" : "You're awesome :)";

            switch (type) {
              case "gold":
                ttl = "Purchase Complete!";
                txt = gVal + " Gold Coins have been added to your Bitty Bank";
                cbt = "Yay! Now lemme go buy stuff!";
              break;
              case "donation":
                ttl = "Thank you so much for your donation!";
                txt = "We really appreciate your support!";
                cbt = "You're awesome :)";
              break;
              case "monthly":
                ttl = "Thank you so much for your support!";
                txt = "You've been given this month's Support Badge Trophy and a Limited Edition Support Badge Item.<br />You may have to refresh the page before you see them show up :)";
                cbt = "Thank you!!!";
              break;
              case "collectible":
                ttl = "Thank you for supporting the creators!";
                txt = "Your items have been sent to your inventory, and any badges you have earned have been added to your account.";
                cbt = "Thank you!!!";
              break;
              case "store":
                ttl = "Thank you for your purchase!";
                txt = "Your items have been packaged up and sent to you.";
                cbt = "Spiffy!";
              break;


              default:
                //something is wrong...
              break;
            }


            swal({
              title:ttl,
              text:txt,
              type:"success",
              closeOnConfirm:true,
              confirmButtonText:cbt
            }, function(isConfirm) {
              if (type == 'donation') {
                givePlayerTrophy(playerID, 5);
              } else if (type == 'gold') {
                givePlayerTrophy(playerID, 12);
                //use gVal to check which coin we will be giving them.
                // 500 1200 3200 7000
                var sob = {message:"Ormyr has sent you this token as a thank you for using the Bank!"};
                switch(gVal) {
                  case 500:   sob.items = [1411]; break;
                  case 1200:  sob.items = [1412]; break;
                  case 3200:  sob.items = [1413]; break;
                  case 7000:  sob.items = [1414]; break;
                  default:
                    //shit done got broked
                  break;
                }
                if (sob.items.length == 1) sendSystemGift(playerID, sob);
              } else if (type == 'monthly') {
                paramQuery({pid:playerID, mid:Number(siteOptions.monthly_item)}, validateMonthly, 'get_monthly_vars');
              } else if (type == 'collectible') {
                completeCollectibleTransaction();
              } else if (type == 'store') {
                completeStoreTransaction();
              }
              // verifySerial(sale.id);
            })
            // insert it into the transaction_history
          } else {
            console.log("payment not approved");
            swal({
              type:'warning',
              title:"Uh-oh!",
              text:"PayPal says your payment wasn't approved :(",
              closeOnConfirm:true
            })
          }
        });
     },
      onError: function(err) {
        // Show an error page here, when an error occurs
        console.error("PayPal Error:", err);
        logError("PayPal", tempType, err, "");

        swal({
          type:'warning',
          title:"Uh-oh!",
          text:"Something went wrong on PayPal's end.\nWe've made a note, and we're looking into it",
          closeOnConfirm:true
        })
      }
  }, '#' + target);
}


function validateTransactionRecord(r) {
  if (r != 'success') console.error(r);
}
function validateLastPayment(r) {
  if (r != 'success') logError("last_payment", tempType, r);
}

function validateMonthly(r) {
  if (r.split(":")[0] != 'success') {
    console.log("Monthly:", r);
  } else {
    givePlayerTrophy(playerID, r.split(":")[1]);
  }
}


function commitSerialTransaction(pid, invoiceID, usd) {
  var sob = {};
  var soi = [];
  var gold = 0;
  for (var i=0; i<cart.length; i++) {
    for (var j=1; j <= cart[i].count; j++) {
      for (var ii=0; ii<cart[i].items.length; ii++) {
        for (var ic=0; ic<cart[i].items[ii].count; ic++) soi.push(cart[i].items[ii].id);
      }
    }
    gold = gold*1 + cart[i].gold*1;  //just because I don't want to deal with possible concatenation issues

  }
  sob.gold = gold;
  sob.items = soi;
  invoice = invoiceID;
  sQuery({pid:pid, usd:usd, invoice:invoiceID, cart:sob}, vCST, 'commit_serial_transaction');
}
function vCST(r) {
  if (r != 'success') console.error(r);
}
function verifySerial(iid, gid) {
  sQuery({invoice:iid, gid:gid}, vCST, 'verify_serial_transaction');
  invoice = undefined;
}
