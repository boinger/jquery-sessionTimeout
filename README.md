# sessionTimeout
[![Build Status](https://travis-ci.com/boinger/jquery-sessionTimeout.svg?branch=master)](https://travis-ci.com/boinger/jquery-sessionTimeout)

---

## Description
After a set amount of time, a dialog is shown to the user with the option to either log out now, or stay connected. If log out now is selected, a logout function is executed. If stay connected is selected, a keep-alive URL is requested through AJAX. If no options is selected after another set amount of time, the page automatically executes a timeout function.

## Usage
1. Include jQuery
2. Include jQuery UI (for dialog)
3. Include jquery.sessionTimeout.js
4. Call `$.sessionTimeout();` after document ready

## Options
**message**<br>
Text shown to user in dialog after warning period.
Default: 'Your session is about to expire.'

**keepAliveUrl**<br>
URL to call through AJAX to keep session alive. This resource should do something innocuous that would keep the session alive, which will depend on your server-side platform.<br>
Default: '/keep-alive'

**keepAliveAjaxRequestType**<br>
How should we make the call to the keep-alive url? (GET/POST/PUT)<br>
Default: 'POST'

**logoutClickAction**<br>
Function to execute if user clicks "Log Out Now".  logout() accepts a parameter to append to the logoutUrl.
Default: 'logout('clicked')'

**timeoutAction**<br>
Function to execute on timeout.  logout() accepts a parameter to append to the logoutUrl.
Default: 'logout("timeout")'

**preLogoutUrl**<br>
URL to load with (intentionally) invalid username/password in order to invalidate an htaccess-authenticated session.  Must return a '200 OK'
Default: /prelogout

**logoutUrl**<br>
URL to load post logout.  logout() can append a string to this URL.
Default: /logout?logoutreason=

**warnAfter**<br>
Time in milliseconds after page is opened until warning dialog is opened.<br>
Default: 900000 (15 minutes)

**redirAfter**<br>
Time in milliseconds after page is opened until browser is redirected to redirUrl.<br>
Default: 1200000 (20 minutes)

**appendTime**<br>
If true, appends the current time stamp to the Keep Alive url to prevent caching issues<br>
Default: true

