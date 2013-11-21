psInputTime
============

AngularJS time selector


<a href="http://plnkr.co/edit/lkmcbmD0XYhmx3bg87cs?p=preview">DEMO</a>

Angular Strap did not easily play well with other date time objects
and editing the time in an INPUT was preferable to AngularUI's control.

    // include js scripts
    <script src="js/angular.js"></script>
    <script src="js/ps-input-time.js"></script>
    // add to your app
    var app = angular.module('myApp', ['ps.inputTime']);
    // add input
    <input type="text" ng-model="myTime" ps-input-time>

Supports input formats: HHmm, hh:mmAM, HH:mm for easy keyboard input. Use arrow keys (up,down,left,right,tab) to select and adjust time.

<p><strong>ngModel:</strong> required, watched, date object, default: local now</p>
<p><strong>fixedDay:</strong> optional, boolean, default: false. If time can move past a 24 hour restriction and adjust the day of the date object.</p>
<p><strong>minuteStep:</strong> optional, numeric, default: 5. How many minutes to increase time when using the UP arrow key. The down arrow key always is 1 minute.</p>
<p><strong>min/max:</strong> optional, watched, date object, forces limits. Important when fixedDay = false</p>


If your interested please rip this apart. Looking for lessons in proper use of AngularJs, javaScript and GitHub.

ToDo
<ul>
  <li>Wrap a popup (like AngularUI) for easy mobile input, or if possible, revert to html5 input=time for mobile.</li>
</ul>
