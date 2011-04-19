/* Andrew W. Hospodor copyright 2011 */

/***** LICENSE ******
Copyright 2011 Andrew Hospodor. All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are
permitted provided that the following conditions are met:

   1. Redistributions of source code must retain the above copyright notice, this list of
      conditions and the following disclaimer.

   2. Redistributions in binary form must reproduce the above copyright notice, this list
      of conditions and the following disclaimer in the documentation and/or other materials
      provided with the distribution.

   3. Neither the name of the Andrew Hospodor, WASP, UCSC, nor the
	  names of its contributors may be used to endorse or promote products
	  derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY Andrew Hospodor ``AS IS'' AND ANY EXPRESS OR IMPLIED
WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL Andrew Hospodor OR
CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

The views and conclusions contained in the software and documentation are those of the
authors and should not be interpreted as representing official policies, either expressed
or implied, of Andrew Hospodor.

************ /LICENSE ************/
/* Used 
   https://developer.mozilla.org/En/How_to_check_the_security_state_of_an_XMLHTTPRequest_over_SSL
   as a reference, guide and template for some of the SSL Security state checking
*/
/* the "(function() {" trick was borrowed from safe@cesaroliveira.net AddOn.
 * while I do not feel this was somehow significant in this code, credit
 * is do where credit is do.*/
(function() {
/* from https://developer.mozilla.org/En/Firefox_addons_developer_guide/Let%27s_build_a_Firefox_extension*/
  var sslbuttonBundle = Components.classes["@mozilla.org/intl/stringbundle;1"].getService(Components.interfaces.nsIStringBundleService);
  var _bundle = sslbuttonBundle.createBundle("chrome://sslbutton/locale/overlay.properties");


const CERT_UNAVAILABLE = 0;
const CERT_GOOD = 1;
const CERT_BAD = 2; 

SSLButton = {

/* This is the "meat and potatoes function"
   This takes in a channel and then checks
   for a valid SSL cert on the channel.
   
   Using the channel.securityInfo in
   conjunction with the 
   Components.interfaces we inspect the
   channel for whether or not the cert has
   been verified or not by the browser.
   
   This means that we do not have to 
   "reinvent the wheel" to show our users
   whether or not SSL is available on their
   current webpage.

 */
1: function (channel) {
    if(channel == null) return false;
    const Ci = Components.interfaces;
    var secInfo = channel.securityInfo;
    
    if((channel instanceof Ci.nsIChannel) 
    && (secInfo instanceof Ci.nsITransportSecurityInfo)
    &&!((secInfo.securityState 
       & Ci.nsIWebProgressListener.STATE_IS_BROKEN) 
       == Ci.nsIWebProgressListener.STATE_IS_BROKEN)
    && secInfo instanceof Ci.nsISSLStatusProvider) {
       
        var cert = 
        secInfo.QueryInterface(Ci.nsISSLStatusProvider).SSLStatus.QueryInterface(Ci.nsISSLStatus).serverCert;
        var verificationResult =
         cert.verifyForUsage(Ci.nsIX509Cert.CERT_USAGE_SSLServer);
         
        if(verificationResult == Ci.nsIX509Cert.VERIFIED_OK 
           && ((secInfo.securityState 
              & Ci.nsIWebProgressListener.STATE_IS_SECURE) 
              == Ci.nsIWebProgressListener.STATE_IS_SECURE))
            return CERT_GOOD;
            
        else return CERT_BAD;
    }
    return CERT_UNAVAILABLE;
  },
  
/* Using content (provided by the button itself),
   this function changes the page of the browser
   tab from http:// to https:// and reloads the
   page.
   
   We do a check in the function as well, to
   "test the waters" to ensure that between the
   button changing color and the user clicking on
   it, that the channel is still open and valid
   for an SSL connection. This protects against
   a delayed attack, or a website's cert going
   bad before a user reloads a page.
   
   This function also handles when users wish to 
   switch out of SSL and back to an insecure 
   connection. This is done by simply changing
   "https://" to "http://". Unfortunately,
   this does not work every where (see 
   https://encrypted.google.com); however, it
   does tend to work in most places.
   
   We added in a constant for any 
   www.google.com/firefox addresses, as for some
   reason, when redirected to:
   "https://www.google.com/firefox" google 
   redirects to a non-https site, and thus 
   our button would always tell the user that 
   from the firefox default home page that no
   SSL connection is available.

*/
2: function (content) {
  //alert(content.location);
  var req = new XMLHttpRequest();
  req.mozBackgroundRequest = true;
  var url = content.location.toString();
  var isSSL = false;
  if(url.indexOf("http://www.google.com/firefox") == 0) {
        url = "http://www.google.com/";
  }
  if(url.indexOf("https://") == 0) {
        isSSL = true;
  }
  var possibleSsl = url.replace("http://", "https://");
  req.open('GET', possibleSsl, true);
  if(isSSL) {
        
        var http_page = url.replace("https://", "http://");
        content.location = url.replace("https://", "http://");
        return;
  }
  req.onreadystatechange = function (aEvt) {  
    if (req.readyState == 4) {
        if(SSLButton[1](req.channel) != CERT_UNAVAILABLE) {
            content.location = possibleSsl;
        } 
    }
  };  
  req.send(null);
  },

}

/* Here we have our event listener which
   listens for page loads and the updates
   the SSL Buttons image and tooltiptext.
   
   The function checks to the status of
   the SSL connection (if present) and
   ensures that there are no problems.
   If there is a connection available,
   it forces a change of the color of 
   the SSL Button and its tooltiptext.
   Color    -> tooltiptext
   Green    -> SSL In Use
   Yellow   -> SSL Questionable - Note, have not seen in practice
   Yellow   -> SSL Bad
   Red      -> SSL Available
   Grey     -> SSL Unavailable
   
   To change values for en-US go to 
   locale/en-US/overlay.properties and 
   edit there. DO NOT CHANGE VALUES 
   FOR tooltiptext HERE!
   
   At the end, it cleans up the onloads 
   with event listeners for on page
   unloads.
*/ 
window.addEventListener("load", function() { mySSLButton.init(); }, false);
var mySSLButton = {
  init: function() {
    var appcontent = document.getElementById("appcontent");   // browser
    if(appcontent) {
      appcontent.addEventListener("DOMContentLoaded", mySSLButton.onPageLoad, true);
      var container = gBrowser.tabContainer;  
      container.addEventListener("TabSelect", mySSLButton.onPageLoad, false);  
    }
  },

  onPageLoad: function(aEvent) {
    var doc = aEvent.originalTarget;
    let onlineBroadcaster = document.getElementById("sslbutton-toolbar-button");
    onlineBroadcaster.setAttribute("value", "grey");
    

    var req = new XMLHttpRequest();
    req.mozBackgroundRequest = true;
    var isSSL = false;
    var url = window.content.location.toString();
    if(url.indexOf("http://www.google.com/firefox") == 0) {
        url = "http://www.google.com/";
    }
    
    if(url.indexOf("https://") != -1) {
        isSSL = true;
    }
    var possibleSsl = url.replace("http://", "https://");
    if(possibleSsl == null || possibleSsl == "") possibleSsl = url;
    req.open('GET', possibleSsl, true); 
    req.onreadystatechange = function (aEvt) {  
        if (req.readyState == 4) {
            var cert_status = SSLButton[1](req.channel);
            if(cert_status != CERT_UNAVAILABLE) {
                if(isSSL) {
                    if(cert_status == CERT_GOOD) {
                        onlineBroadcaster.setAttribute("value", "green");
                        onlineBroadcaster.setAttribute("tooltiptext", _bundle.GetStringFromName("sslinuse"));
                    } else if(cert_status == CERT_BAD) {
                        onlineBroadcaster.setAttribute("value", "yellow");
                        onlineBroadcaster.setAttribute("tooltiptext", _bundle.GetStringFromName("sslquestionable"));
                    }
                } else {
                    onlineBroadcaster.setAttribute("value", "red");
                    onlineBroadcaster.setAttribute("tooltiptext", _bundle.GetStringFromName("sslavailable"));
                }
            } else if(isSSL) {
                onlineBroadcaster.setAttribute("value", "yellow");
                onlineBroadcaster.setAttribute("tooltiptext", _bundle.GetStringFromName("sslbad"));
            } else {
                onlineBroadcaster.setAttribute("value", "grey");
                onlineBroadcaster.setAttribute("tooltiptext", _bundle.GetStringFromName("sslunavailable"));
            }
        }
    };  
    req.send(null);

    aEvent.originalTarget.defaultView.addEventListener("unload", function(){ mySSLButton.onPageUnload(); }, true);
  },

  onPageUnload: function(aEvent) {
    appcontent.removeEventListener("DOMContentLoaded", mySSLButton.onPageLoad, true);
    container.removeEventListener("TabSelect", mySSLButton.onPageLoad, false);
  }
}
})();
