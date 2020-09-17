/*jslint browser */
/*jslint eval */
/*global window */

//
// jquery.sessionTimeout.js
//
// from https://github.com/boinger/jquery-sessionTimeout
// based on https://github.com/travishorn/jquery-sessionTimeout/blob/master/jquery.sessionTimeout.js
//
// After a set amount of time, a dialog is shown to the user with the
// option to either log out now, or stay connected. If log out now is
// selected, a logout function is executed. If stay connected is selected,
// a keep-alive URL is requested through AJAX. If no options is selected
// after another set amount of time, the page automatically executes a
// timeout function.
//
// As configured, the logout() function "tricks" the browser into terminating
// a htaccess authenticated session using an invalid username/password
// (logout/logout) to replace the current/valid ones.
//
//
// OPTIONS
//
//   message
//     Text shown to user in dialog after warning period.
//
//   keepAliveUrl
//     URL to call through AJAX to keep session alive. This resource should do something innocuous that would keep the session alive, which will depend on your server-side platform.
//     Default: '/keep-alive'
//
//   keepAliveAjaxRequestType
//     How should we make the call to the keepAliveUrl? (GET/POST/PUT)
//     Default: 'POST'
//
//   logoutClickAction
//     Function to execute if user clicks "Log Out Now".  logout() accepts a parameter to append to the logoutUrl.
//     Default: 'logout('1')'
//
//   timeoutAction
//     Function to execute on timeout.  logout() accepts a parameter to append to the logoutUrl.
//     Default: 'logout("timeout")'
//
//   preLogoutUrl
//     URL to load with (intentionally) invalid username/password in order to invalidate an htaccess-authenticated session.  Must return a '200 OK'
//     Default: /prelogout
//
//   logoutUrl
//     URL to load post logout.  logout() can append a string to this URL.
//     Default: /logout?logoutreason=
//
//   warnAfter
//     Time in milliseconds after page is opened until warning dialog is opened
//     Default: 900000 (15 minutes)
//
//   redirAfter
//     Time in milliseconds after page is opened until browser is logged out
//     Default: 1200000 (20 minutes)
//
//   appendTime
//     If true, appends the current time stamp to the keepAliveUrl to prevent caching issues
//     Default: true
//
(function ($) {
    jQuery.sessionTimeout = function (options) {
        var defaults = {
            message: 'Your session is about to expire.',
            keepAliveUrl: '/keep-alive',
            keepAliveAjaxRequestType: 'POST',
            logoutClickAction: 'logout("clicked")',
            timeoutAction: 'logout("timeout")',
            preLogoutUrl: '/prelogout', // must return a '200 OK'
            logoutUrl: '/logout?logoutreason=',
            warnAfter: 900000, // 15 minutes
            redirAfter: 1200000, // 20 minutes
            appendTime: true // append time stamp to keepAliveUrl to prevent caching?
        };

        // Extend user-set options over defaults
        var o = defaults,
            dialogTimer,
            redirTimer;

        if (options) {
            o = $.extend(defaults, options);
        }

        // Create timeout warning dialog
        $('body').append('<div title="Session Timeout" id="sessionTimeout-dialog">' + o.message + '</div>');
        $('#sessionTimeout-dialog').dialog({
            autoOpen: false,
            width: 400,
            modal: true,
            closeOnEscape: false,
            open: function () {
                $(".ui-dialog-titlebar-close").hide();
            },
            buttons: {
                // Button one - performs logoutAction
                "Log Out Now": function () {
                    eval(o.logoutClickAction);
                },
                // Button two - closes dialog and makes call to keepAliveUrl
                "Stay Connected": function () {
                    $(this).dialog('close');

                    $.ajax({
                        type: o.keepAliveAjaxRequestType,
                        url: o.appendTime ? updateQueryStringParameter(o.keepAliveUrl, "_", new Date().getTime()) : o.keepAliveUrl
                    });

                    // Stop redirect timer and restart warning timer
                    controlRedirTimer('stop');
                    controlDialogTimer('start');
                }
            }
        });

        function controlDialogTimer(action) {
            switch (action) {
            case 'start':
                // After warning period, show dialog and start redirect timer
                dialogTimer = setTimeout(function () {
                    $('#sessionTimeout-dialog').dialog('open');
                    controlRedirTimer('start');
                }, o.warnAfter);
                break;

            case 'stop':
                clearTimeout(dialogTimer);
                break;
            }
        }

        function controlRedirTimer(action) {
            switch (action) {
            case 'start':
                // Dialog has been shown, if no action taken during redir period, redirect
                redirTimer = setTimeout(function () {
                    eval(o.timeoutAction);
                }, o.redirAfter - o.warnAfter);
                break;

            case 'stop':
                clearTimeout(redirTimer);
                break;
            }
        }

        // Courtesy of http://stackoverflow.com/questions/5999118/add-or-update-query-string-parameter
        // Includes fix for angular ui-router as per comment by j_walker_dev
        function updateQueryStringParameter(uri, key, value) {
            var re = new RegExp("([?|&])" + key + "=.*?(&|#|$)", "i");

            if (uri.match(re)) {
                return uri.replace(re, '$1' + key + "=" + value + '$2');
            } else {
                var hash = '';

                if (uri.indexOf('#') !== -1) {
                    hash = uri.replace(/.*#/, '#');
                    uri = uri.replace(/#.*/, '');
                }

                var separator = uri.indexOf('?') !== -1 ? "&" : "?";
                return uri + separator + key + "=" + value + hash;
            }
        }

        function logout(value) {
            var xmlhttp;
            if (window.XMLHttpRequest) {
                xmlhttp = new XMLHttpRequest();
            } else if (window.ActiveXObject) { // code for IE:
                xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
            }
            if (window.ActiveXObject) {
                // IE clear HTTP Authentication:
                document.execCommand("ClearAuthenticationCache");
                window.location.href = o.logoutUrl + value;
            } else {
                xmlhttp.open("GET", o.preLogoutUrl, true, "logout", "logout");
                xmlhttp.send("");
                xmlhttp.onreadystatechange = function () {
                    if (xmlhttp.readyState === 4) {
                        window.location.href = o.logoutUrl + value;
                    }
                };
            }

            return false;
        }

        $(document).ajaxComplete(function () {
            if (!$('#sessionTimeout-dialog').dialog("isOpen")) {
                controlRedirTimer('stop');
                controlDialogTimer('stop');
                controlDialogTimer('start');
            }
        });

        // Begin warning period
        controlDialogTimer('start');
    };
}(jQuery));
