     
 /*  
BENJAMIN TO-DO LIST / OUTSTANDING ISSUES

- in the 360, when you clear the search, I am not able to focus the form field because of timing. It is kind of like wait for element, but it is not about it existing, but rather about whether it is visible at the moment. 

- What to show if a tab or section doesn't exist

- prevent people from trying to load a command directly where the data is sensitive

- possibly change the main menu to work the same way as the other links with onClick calls instead. Just need to incorporate the current section and current item handling into the main function.

- resolve a conflict between the default section/subsection loading and the current section/subsection loading - I think it is only a problem on subsection right now


*/

// make some changes to the header
$(".c_header_ribbon_inner.cr").append(
  '<div id="portal-title"><h1>Success Portal</h1></div><div id="portal-global"></div>'
);
$("#global").appendTo("#portal-global");

//
// FUNCTIONS THAT ARE CALLED BY THE PORTAL
//

function setPortalHeight() {
  // adjust the height of the portal body
  var header_height = $("#c_header-wrapper").height();
  var window_height = $(window).height();
  var window_width = $(window).width();
  
  if (window_width > 800) {
    $("#portal-body-framework").css(
      "height",
       window_height - header_height + "px"
     );
     $("#portal-content").css("height", window_height - header_height + "px");
   }
}
      
      
      

let parser = (url) =>
  url
    .slice(url.indexOf("?") + 1)
    .split("&")
    .reduce((a, c) => {
      let [key, value] = c.split("=");
      a[key] = value;
      return a;
    }, {});

// this updates the URL without reloading the page
const updateUrl = (newUrl, title = null) => {
  window.history.pushState(null, title, newUrl);
};

// a handy helper function that reads values off a query string
function getUrlVars() {
  var vars = [],
    hash;
  var hashes = window.location.href
    .slice(window.location.href.indexOf("?") + 1)
    .split("&");
  for (var i = 0; i < hashes.length; i++) {
    hash = hashes[i].split("=");
    vars.push(hash[0]);
    vars[hash[0]] = hash[1];
  }
  return vars;
}

// a handy helper function that allows an action to wait patiently until the thing it is changing is ready
function waitForElm(selector) {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }
    const observer = new MutationObserver((mutations) => {
      if (document.querySelector(selector)) {
        observer.disconnect();
        resolve(document.querySelector(selector));
      }
    });
    // If you get "parameter 1 is not of type 'Node'" error, see https://stackoverflow.com/a/77855838/492336
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}

      
      
      


      
function updateMenuSelections(within, type, id) {
  var updateselector = "#"+within+" a[data-"+type+"='" + id + "']";
  //console.log("update selector: "+updateselector);
   waitForElm("#"+within+" a[data-"+type+"='" + id + "']").then(
    (elm) => {
      $("#"+within+" a[data-"+type+"]").removeClass("selected");
      $("#"+within+" a[data-"+type+"='" + id + "']").addClass(
        "selected"
      );
    }
  );
}
      
      
      
      
function requestSectionRefresh(refresh_element) {
  console.log('request refresh called for '+refresh_element);
  waitForElm(refresh_element).then((elm) => {
    $(refresh_element).attr("data-refresh", "1");
  });
}

      
      
      
// a tab, section, subsection, and item loader function that checks to make sure a request is valid since the user can manipulate it
// and then loads the content if necessary and shows it
// if there is an item it creates a new div, then loads and displays it when needed

var loadSelection = function (tab, section, item, subsection) {
  //console.log("loadSelection called with "+tab+"|"+section+"|"+item+"|"+subsection);

  // establish an error message div to load if they request content that doesn't exist
  var error_message =
    '<div class="error_msg tab_content">The requested content was not found. It may be that the link you used is incorrect or you may not be authorized to view the content you requested.</div>';

  // hide the current content so we can load the new
  $("#portal-content .tab_content").addClass("hidden");
  $("#portal-content .section_content").addClass("hidden");
  $("#portal-content .subsection_content").addClass("hidden");

  // first check to see if the tab exists/is valid
  if ($("#tab_" + tab).length > 0) {
    // load the tab
    if ($("#tab_" + tab).html().length < 1) {
      FW.Lazy.Fetch("?cmd=" + tab, $("#tab_" + tab));
    }
    $("#tab_" + tab).removeClass("hidden");
    
    
    updateMenuSelections('portal-body-framework', 'tab', tab);

    // check to see if this tab has a default section
    var default_section = $("a[data-tab='" + tab + "']").data(
      "default-section"
    );

    if (section || default_section) {
      if (!section) {
        section = default_section;
      }
      
      updateMenuSelections('tab_'+tab, 'section', section);
      
      // make sure the section exists / is valid
      waitForElm("#section_" + section).then((elm) => {
        // set this as the current section on the main menu link in case someone clicks that again
        $("#tab_" + tab).attr("data-current-section", section);

        // figure out if the section is marked for a refresh
        var section_refresh = $("#tab_" + tab + " #section_" + section).attr(
          "data-refresh"
        );
        // reset that regardless
        $("#tab_" + tab + " #section_" + section).attr("data-refresh", "");

        // load the section
        if (!item) {
          // wipe out the current item attribute since there isn't one this time
          $("#tab_" + tab).attr("data-current-item", "");

          if (
            $("#tab_" + tab + " #section_" + section).html().length === 0 ||
            section_refresh
          ) {
            FW.Lazy.Fetch(
              "?cmd=" + section + "&section=" + section,
              $("#tab_" + tab + " #section_" + section)
            );
          }
          $("#tab_" + tab + " #section_" + section).removeClass("hidden");
        } else {
          // there is an item

          // set this as the current section on the main menu link in case someone clicks that again
          $("#tab_" + tab).attr("data-current-item", item);

          if (
            $("#section_" + section + "_" + item).length === 0 ||
            section_refresh
          ) {
            // wrapper div not there yet
            //create/load a new item-specific div

            if (!section_refresh) {
              $("#tab_" + tab).append(
                '<div id="section_' +
                  section +
                  "_" +
                  item +
                  '" class="hidden section_content"></div>'
              );
            }

            FW.Lazy.Fetch(
              "?cmd=" + section + "&section=" + section + "&item=" + item,
              $("#section_" + section + "_" + item)
            );
          }
          $("#section_" + section + "_" + item).removeClass("hidden");
        }

        // Now, handle subsections when applicable

        // check to see if this section has a default subsection
        var default_subsection = $("#section_" + section).data(
            "default-subsection"
        );

        if (subsection || default_subsection) {
          
           if (!subsection) {
                subsection = default_subsection;
           }
          
            // some variables will be dynamic if there is an item, so create those here to reflect that
            if (item) {
              var itemized_section = section + "_"+item;
              var itemized_subsection = item + "_" + subsection;
            } else {
              var itemized_section = section;
              var itemized_subsection = subsection;
            }

             updateMenuSelections('section_'+itemized_section, 'subsection', itemized_subsection);
           

            // make sure the subsection exists / is valid
           //console.log("Looking for the subsection called: " + "#subsection_" + itemized_subsection);
            waitForElm("#subsection_" + itemized_subsection).then((elm) => {

                // set this as the current subsection on the main section in case someone clicks that again
                $("#tab_" + tab).attr("data-current-subsection", itemized_subsection);
                $("#section_" + itemized_section).attr("data-current-subsection", itemized_subsection);

                // figure out if the subsection is marked for a refresh
                var subsection_refresh = $("#tab_" + tab + " #section_" + itemized_section + " #subsection_" + itemized_subsection).attr(
                    "data-refresh"
                );
                // reset that regardless
                $("#tab_" + tab + " #section_" + itemized_section + " #subsection_" + itemized_subsection).attr("data-refresh", "");

                // load the subsection
                    
        
                    if (
                    $("#tab_" + tab + " #section_" + itemized_section + " #subsection_" + itemized_subsection).html().length === 0 ||
                    subsection_refresh
                    ) {
                        FW.Lazy.Fetch(
                            "?cmd=" + subsection + "&item=" + item,
                            $("#tab_" + tab + " #section_" + itemized_section + " #subsection_" + itemized_subsection)
                        );
                    }
                    $("#tab_" + tab + " #section_" + itemized_section + " #subsection_" + itemized_subsection).removeClass("hidden");
                
                
            });

        }

      });
    } 
    } else { // requested tab does not exist
        $("#portal-content").append(error_message);
    }
};
      
      
      

var loadTab = function (request, isBack = false) {
  
  var req_parts = parser(request);
  var tab = req_parts["tab"];
  var section = req_parts["section"];
  var item = req_parts["item"];
  var subsection = req_parts["subsection"];

  loadSelection(tab, section, item, subsection);

  //updateMenuSelections(tab, section, subsection);

  var use_state = {
    tab: tab,
    section: section,
    item: item,
    subsection: subsection
  };
  //console.log('Use state: '+JSON.stringify(use_state));
  if (!isBack) history.pushState(use_state, null, request);
};

// Appointment-Related Things

function markAppointmentAttended(response_guid) {
  // first do the update
  $.ajax({
    url: "?cmd=appt_mark_attended&response_guid=" + response_guid,
    method: "POST",
    data: {
      cmd: "appt_mark_attended",
    },
  })
    .done(function (result) {
      //console.log('Attend successfully logged.')
      // then refresh the listing
      refreshLists();
    })
    .fail(function () {
      console.log("Attend error.");
    });
}

function markAppointmentNoShow(response_guid) {
  // first do the update
  $.ajax({
    url: "?cmd=appt_mark_noshow&response_guid=" + response_guid,
    method: "POST",
    data: {
      cmd: "appt_mark_noshow",
    },
  })
    .done(function (result) {
      //console.log('Noshow successfully logged.')
      // then refresh the listing
      refreshLists();
    })
    .fail(function () {
      console.log("Noshow error.");
    });
}

      
      
      
      
      
//
// SET UP LISTENERS FOR ACTIONS THAT NEED A RESPONSE
//

// respond to the click on the mobile menu header to open and close the menu
$("#portal-menu .mobile-menu-header").click(function () {
  $("#portal-menu div.slide_menu").toggleClass("mobile_hidden");
});
$("#portal-menu ul li.menu-item").click(function () {
  $("#portal-menu div.slide_menu").toggleClass("mobile_hidden");
});

// if the window size changes, then reset the portal height
$(window).on("resize", function () {
  setPortalHeight();
});

/* catch history changes */

window.addEventListener("popstate", function (e) {
  //console.log("popstate listener was called");
  //console.log(e.state);
  //console.log(location.search.substring(1));
  //console.log(e);
  popRequest = "?tab=" + e.state["tab"];
  if (e.state["section"]) {
    popRequest += "&section=" + e.state["section"];
  }
  if (e.state["item"]) {
    popRequest += "&item=" + e.state["item"];
  }
  if (e.state["subsection"]) {
    popRequest += "&subsection=" + e.state["subsection"];
  }
  if (e.state) loadTab(popRequest, true);
  else history.back();
});

      
      
/* respond to main menu clicks */
   
$("a[data-tab]").on("click", function () {
  var use_tab = $(this).data("tab");
  var use_section = $("#tab_" + use_tab).data("current-section")
    ? "&section=" + $("#tab_" + use_tab).data("current-section")
    : "";
  var use_item = $("#tab_" + use_tab).data("current-item")
    ? "&item=" + $("#tab_" + use_tab).data("current-item")
    : "";
  var use_subsection = $("#tab_" + use_tab).data("current-subsection")
    ? "&subsection=" + $("#tab_" + use_tab).data("current-subsection")
    : "";
  //console.log(use_tab + "|" + use_section + "|" + use_item);
  loadTab("?tab=" + use_tab + use_section + use_item + use_subsection, null);
  return false;
});
   
      
      

//
// DO THINGS ON INITIAL PAGE LOAD
//

$(document).ready(function () {
  // handle the tab loading
  // when the page loads, check to see if it should pre-load something from the URL, if not, load the default */
  var qs = FW.decodeFormValues(location.search.substring(1));
  //console.log('attempting to load the search string which is: ?'+location.search.substring(1));
  if (qs["tab"]) loadTab("?" + location.search.substring(1));
  else {
    //var default_tab = $("ul.subtabs").find("li > a").eq(0).data("tab");
    //loadTab('home',null,'12345');
    loadTab("?tab=home");
  }

  // move the portal title up into the header
  $("div#portal-title").append($("h1#portal-title"));

  // set the portal body's height based on the current size of the window
  setPortalHeight();
});

