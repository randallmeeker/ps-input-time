angular.module('ps.inputTime', [])
.directive("psInputTime", function($filter) {
    var TIME_REGEXP = '((0?[0-9])|(1[0-2]))(:|\s)([0-5][0-9])[ap]m';
    return {
        restrict: "A",
        require: '?^ngModel',
        scope: {},
        link: function(scope, element, attrs, ngModel) {
            if (!ngModel) {
                return; // do nothing if no ng-model
            }
            element.on('keydown', function(e) {
                switch (e.keyCode) {
                    case 37:
                        // left button hit
                        tabBackward(e);
                        break;
                    case 38:
                        // up button hit
                        addTime();
                        e.preventDefault();
                        break;
                    case 39:
                        // right button hit
                        tabForward(e);
                        break;
                    case 40:
                        // down button hit
                        subtractTime();
                        e.preventDefault();
                        break;
                    case 9:
                        // TAB
                        break;
                    default:
                        // e.preventDefault();
                        break;
                }

            }).on('click', function() {

                selectTime(getSelectionPoint())

            }).on('focus', function(e) {
                e.preventDefault();
                selectTime('hour');
            })
            

            var timeRegExp = new RegExp('^' + TIME_REGEXP + '$', ['i']);

            function tabForward(e) {
                var cspot = getSelectionPoint();
                if (cspot == 'hour') {
                    selectTime('minute')
                    e.preventDefault();
                } else if (cspot == 'minute') {
                    selectTime('meridian')
                    e.preventDefault();
                } else {
                    selectTime('hour')
                }
            }

            function tabBackward(e) {
                var cspot = getSelectionPoint();
                if (cspot == 'meridian') {
                    selectTime('minute')
                    e.preventDefault();
                } else if (cspot == 'minute') {
                    selectTime('hour')
                    e.preventDefault();
                } else {
                    selectTime('meridian')
                }
            }

            function getSelectionPoint() {
                var pos = element.prop("selectionStart")
                if (pos < 3) {
                    return 'hour'
                } else if (pos < 5) {
                    return 'minute'
                } else if (pos < 8) {
                    return 'meridian'
                }
            }

            function selectTime(part) {
                if (part == 'hour') {
                    setTimeout(function() {
                        element[0].setSelectionRange(0, 2);
                    }, 0);
                } else if (part == 'minute') {
                    setTimeout(function() {
                        element[0].setSelectionRange(3, 5)
                    }, 0);
                } else {
                    setTimeout(function() {
                        element[0].setSelectionRange(5, 7)
                    }, 0);
                }
            }

            function formatter(value) {
                if (value) {
                    return $filter('date')(value, 'hh:mma');
                }
            }
            ngModel.$formatters.push(formatter);

            function parser(value) {
                if (value) {
                    if(timeRegExp.test(element.val())){
                        parsedTime = parseTime(element.val())
                        selected = isNaN(ngModel.$modelValue) ? new Date() : ngModel.$modelValue;
                        selected.setHours(parsedTime.hours, parsedTime.minutes)
                        ngModel.$setValidity('time', true)
                        return new Date(selected)
                    } else{
                        ngModel.$setValidity('time', false)
                        return ngModel.$modelValue
                    }
                }
            }
            ngModel.$parsers.push(parser);

            function addTime() {
                var cPoint = getSelectionPoint();
                if (cPoint == 'hour') {
                    addMinutes(60);
                } else if (cPoint == 'minute') {
                    addMinutes(1);
                } else if (cPoint == 'meridian') {
                    if (ngModel.$modelValue.getHours > 12) {
                        addMinutes(-720)
                    } else {
                        addMinutes(720)
                    }
                }
                selectTime(cPoint);
            }

            function subtractTime() {
                var cPoint = getSelectionPoint();
                if (cPoint == 'hour') {
                    addMinutes(-60);
                } else if (cPoint == 'minute') {
                    addMinutes(-1);
                } else if (cPoint == 'meridian') {
                    if (ngModel.$modelValue.getHours > 12) {
                        addMinutes(720)
                    } else {
                        addMinutes(-720)
                    }
                }
                selectTime(cPoint);
            }
            // hhmmaa hh:mmaa HH:mmaa h:mm
            function parseTime(time){
                var hours = Number(time.match(/^(\d+)/)[1]);
                var minutes = Number(time.match(/:(\d+)/)[1]);
                var AMPM = time.match(/[apAP][mM]/)[0];
                AMPM = AMPM.toUpperCase();
                if(AMPM == "PM" && hours<12) hours = hours+12;
                if(AMPM == "AM" && hours==12) hours = hours-12;
                var sHours = hours.toString();
                var sMinutes = minutes.toString();
                if(hours<10) sHours = "0" + sHours;
                if(minutes<10) sMinutes = "0" + sMinutes;
                return {hours: sHours, minutes : sMinutes};
            }
            
            function addMinutes(minutes) {
                selected = ngModel.$modelValue;
                if( isNaN(selected) ){
                    selected = new Date();
                }
                var dt = new Date(selected.getTime() + minutes * 60000);
                selected.setHours(dt.getHours(), dt.getMinutes());

                scope.$apply(function() {
                    element.val(formatter(selected))
                    ngModel.$setViewValue(new Date(selected));
                });
            }
        }
    }
})
