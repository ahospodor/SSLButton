window.addEventListener("load", function() {

var myId    = "sslbutton-toolbar-button"; // ID of button to add
var afterId = "home-button";    // ID of element to insert after

/* https://developer.mozilla.org/en/Code_snippets/Preferences*/
var prefs   = Components.classes["@mozilla.org/preferences-service;1"]
                  .getService(Components.interfaces.nsIPrefService);
prefs       = prefs.getBranch("extensions.ssl-button@understandable-security-measures.");

var install = prefs.getBoolPref("install");
if(install) {
   prefs.setBoolPref("install", false);
}
else {
   return;
}

/* https://developer.mozilla.org/en/Code_snippets/Toolbar */
var navBar      = document.getElementById("nav-bar");
var navToolbox  = document.getElementById("navigator-toolbox");
var curSet      = navBar.currentSet.split(",");
if (curSet.indexOf(myId) == -1) {
   var pos = curSet.indexOf(afterId) + 1 || curSet.length;
   var set = curSet.slice(0, pos).concat(myId).concat(curSet.slice(pos));

   navBar.setAttribute("currentset", set.join(","));
   navBar.currentSet = set.join(",");
   navToolbox.ownerDocument.persist(navBar.id, "currentset");
   try {
      BrowserToolboxCustomizeDone(true);
   } catch (e) {}
}
}, false);