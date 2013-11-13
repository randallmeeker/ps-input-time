pl-timeinput
============

AngularJS time selector


<a href="http://plnkr.co/edit/lkmcbmD0XYhmx3bg87cs?p=preview">DEMO</a>

Angular Strap did not easily play well with other date time objects
and editing the time in an INPUT was preferable to AngularUI's control.

&lt;input type=&quot;text&quot; ng-model=&quot;myTime&quot; pl-time-picker&gt;;

If your interested please rip this apart. Looking for lessons in proper use of AngularJs, javaScript and GitHub.

ToDo
<ul>
  <li>Select each time part needs to fail silently when manually editing time</li>
  <li>Wrap a popup (like AngularUI) for easy mobile input, or if possible, revert to html5 input=time for mobile.</li>
  <li>Support inputing time in the following additional formats HH:mm, HHmm, hhmmAA (for speed I want time to be able to be input with keypad only)</li>
  <li>KeyPress TAB should scroll through time parts, and leave input after.</li>
</ul>
