angular.module('ps.inputTime', [])
.value('psInputTimeConfig', {
        minuteStep : 5,
        minDate : null,
        maxDate : null,
        fixedDay: true
    })
.directive("psInputTime", ['$filter', 'psInputTimeConfig', '$parse', function($filter, psInputTimeConfig, $parse) {
    var temp12hr = '((0?[0-9])|(1[0-2]))(:|\s)([0-5][0-9])[ap]m',
        temp24hr = '([01]?[0-9]|2[0-3])[:;][0-5][0-9]',
        temp24noColon = '(2[0-3]|[01]?[0-9])([0-5][0-9])';
    var customFloor = function(value, roundTo) {
        return Math.floor(value / psInputConfig.minuteStep) * psInputConfig.minuteStep;
    };
    var timeTest12hr = new RegExp('^' + temp12hr + '$', ['i']),
        timeTest24hr = new RegExp('^' + temp24hr + '$', ['i']),
        timeTest24noColon = new RegExp('^' + temp24noColon + '$', ['i']);
    return {
        restrict: "A",
        require: '?^ngModel',
        scope: {},
        link: function(scope, element, attrs, ngModel) {
            if (!ngModel) return; // do nothing if no ng-model
            
            ngModel.$render = function () {
               
            };            

            var minuteStep = getValue(attrs.minuteStep, psInputTimeConfig.minuteStep),
                fixedDay = getValue(attrs.fixedDay, psInputTimeConfig.fixedDay),
                maxDate = null,
                minDate = null

            function getValue(value, defaultValue) {
                return angular.isDefined(value) ? scope.$parent.$eval(value) : defaultValue;
            }

            if(attrs.min || attrs.max){
                fixedDay = false;
            }

            if (attrs.min) {
                scope.$parent.$watch($parse(attrs.min), function(value) {
                  minDate = value ? new Date(value) : null;
                  if(minDate !== null && ngModel.$modelValue < minDate){
                      ngModel.$setValidity('time-min', false);
                  }else if (minDate !== null) ngModel.$setValidity('time-min', true);
                });
            }
            
            if (attrs.max) {
                scope.$parent.$watch($parse(attrs.max), function(value) {
                  maxDate = value ? new Date(value) : null;
                  if(maxDate !== null && ngModel.$modelValue > maxDate){
                      ngModel.$setValidity('time-max', false);
                  } else if (maxDate !== null) ngModel.$setValidity('time-max', true);              
                });
            }


            var reservedKey = false;

            element.on('keydown', function(e) {
                reservedKey = false;
                switch (e.keyCode) {
                    case 37:
                        // left button hit
                        if(verifyFormat()){ 
                            tabBackward(e);
                            reservedKey = true;
                        }
                        break;
                    case 38:
                        // up button hit
                        if(verifyFormat()) {
                            addTime();
                            reservedKey = true;
                        }
                        break;
                    case 39:
                        // right button hit
                        if(verifyFormat()){ 
                            tabForward(e);
                            reservedKey = true;
                            
                        }
                        break;
                    case 40:
                        // down button hit
                        if(verifyFormat()) {
                            subtractTime();
                            reservedKey = true;
                        }
                        break;
                    case 9:
                        // TAB

                        if(verifyFormat()){
                            if(e.shiftKey){
                                if(getSelectionPoint() != 'hour') {
                                    reservedKey = true;
                                    tabBackward(e);
                                }
                            } else{
                                if(getSelectionPoint() != 'meridian') {
                                    reservedKey = true;
                                    tabForward(e);
                                }
                            }
                        }
                        
                       
                        break;
                    default:
                        // e.preventDefault();
                        break;
                }
                if(reservedKey){
                    e.preventDefault();
                }
            }).on('keyup', function(){
                if(checkTimeFormat(element.val()) != 'invalid' && !reservedKey){
                    scope.$apply(function (){
                        ngModel.$setViewValue(createDateFromTime(element.val(), ngModel.$modelValue));
                    });                          
                }
                
            }).on('click', function() {

                selectTime(getSelectionPoint());

            });

            function verifyFormat(){
                if(checkTimeFormat( element.val() ) == '12hr') return true;
                else if (element.val() === ''){
                    element.val(formatter(getDefaultDate()));
                    selectTime('hour');
                    return true;                    
                }
                else if (checkTimeFormat( element.val() ) != 'invalid') {
                    element.val(formatter(ngModel.$modelValue));
                    selectTime('hour');
                    return true;
                } else return false;
            }

            function selectTime(part) {
                if (part == 'hour') {
                    setTimeout(function() {
                        element[0].setSelectionRange(0, 2);
                    }, 0);
                } else if (part == 'minute') {
                    setTimeout(function() {
                        element[0].setSelectionRange(3, 5);
                    }, 0);
                } else {
                    setTimeout(function() {
                        element[0].setSelectionRange(5, 7);
                    }, 0);
                }
            }

            function getSelectionPoint() {
                var pos = element.prop("selectionStart");
                if (pos < 3) {
                    return 'hour';
                } else if (pos < 5) {
                    return 'minute';
                } else if (pos < 8) {
                    return 'meridian';
                } else return 'unkown';
            }

            function tabForward() {
                var cspot = getSelectionPoint();
                if (cspot == 'hour') {
                    selectTime('minute');
                } else if (cspot == 'minute') {
                    selectTime('meridian');
                } else {
                    selectTime('hour');
                }
            }

            function tabBackward(e) {
                var cspot = getSelectionPoint();
                if (cspot == 'meridian') {
                    selectTime('minute');
                    e.preventDefault();
                } else if (cspot == 'minute') {
                    selectTime('hour');
                    e.preventDefault();
                } else {
                    selectTime('meridian');
                }
            }
            
            function getDefaultDate(){
                if(minDate !== null) return new Date(minDate)
                else if (maxDate !== null) return new Date(maxDate)
                else return new Date();
            }

            function parser(value) {
                
                if(value){
                    
                    if(value instanceof Date){
                        ngModel.$setValidity('time', true);
                        
                        if(minDate !== null && value < minDate) value = minDate;
                        if(maxDate !== null && value > maxDate) value = maxDate;
                        
                        return value;
                        
                    } else{
                        ngModel.$setValidity('time', false);
                        return ngModel.$modelValue;
                    }
                    
                }
                
            }
            
            ngModel.$parsers.push(parser);
            
            function formatter(value) {
                
                if (value) {
                    
                    return $filter('date')(value, 'hh:mma');
                }
            }
            
            ngModel.$formatters.push(formatter);     
            
            function createDateFromTime(time,cdate){
                if(isNaN(cdate)){
                    cdate = getDefaultDate();
                }
                var ct = checkTimeFormat(time),
                        minutes, hours, ampm, sHours, sMinutes;
                if(ct == '12hr'){
                    hours = Number(time.match(/^(\d+)/)[1]);
                    minutes = Number(time.match(/:(\d+)/)[1]);
                    AMPM = time.match(/[apAP][mM]/)[0];
                    if(AMPM == "PM" && hours<12) hours = hours+12;
                    if(AMPM == "AM" && hours==12) hours = hours-12;                   
                } else if (ct == '24hr'){
                    hours = time.split(/[;:]/)[0];
                    minutes = time.split(/[;:]/)[1];
                } else if (ct == '24nc') {
                    hours = time.length == 4 ? time.substr(0,2) : time.substr(0,1);
                    minutes = time.substr(-2);
                } else {
                    return 'invalid';
                }
                sHours = hours.toString();
                sMinutes = minutes.toString();
                if(hours<10) sHours = "0" + sHours;
                if(minutes<10) sMinutes = "0" + sMinutes;
                cdate.setHours(sHours,sMinutes);
                return new Date(cdate);
            }
            
            function checkTimeFormat(value){
                if(timeTest12hr.test(value)) return '12hr';
                else if (timeTest24hr.test(value)) return '24hr';
                else if (timeTest24noColon.test(value)) return '24nc';
                else return 'invalid';
            }
            
            
            function addTime() {
                var cPoint = getSelectionPoint();
                if (cPoint == 'hour') {
                    addMinutes(60);
                } else if (cPoint == 'minute') {
                     addMinutes(minuteStep);
                } else if (cPoint == 'meridian') {
                    if (ngModel.$modelValue.getHours > 12) {
                        addMinutes(-720);
                    } else {
                        addMinutes(720);
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
                        addMinutes(720);
                    } else {
                        addMinutes(-720);
                    }
                }
                selectTime(cPoint);
            }
            
            function addMinutes(minutes){
                selected = ngModel.$modelValue;
                dt = new Date(selected.getTime() + minutes * 60000);
                if(fixedDay == true || fixedDay == 'true'){
                    dt = selected.setHours(dt.getHours(), dt.getMinutes());
                    dt = new Date(dt);
                }
                scope.$apply(function (){
                    ngModel.$setViewValue(dt);
                });
                element.val(formatter(ngModel.$modelValue));
            }
        
        }
    };
}]);
