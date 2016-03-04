  angular.module('ps.inputTime', [])
    .value('psInputTimeConfig', {
      minuteStep: 5,
      minDate: null,
      maxDate: null,
      fixedDay: true,
      format: 'hh:mma'
    })
    .directive("psInputTime", ['$filter', 'psInputTimeConfig', '$parse', function ($filter,
        psInputTimeConfig, $parse) {
        //var temp12hr = '((0?[0-9]{1})|(1[0-2]{1}))(:|\s)([0-5][0-9])[apAP][mM]',
        var temp12hr = '((0[1-9])|(1[0-2]))(:)([0-5][0-9])[apAP][mM]',
        temp12hr2 = '(([])|(0[1-9]?)|(1[0-2]?))(:)([0-5][0-9]?)[apAP][mM]',
          //var temp12hr ='^(00|0[0-9]|1[012]):[0-5][0-9] ?((a|p)m|(A|P)M)$',
          temp12noColon = '((0?[0-9])|(1[0-2]))([0-5][0-9])[apAP][mM]',
          temp24hr = '([01]?[0-9]|2[0-3])[:;][0-5][0-9]',
          temp24noColon = '(2[0-3]|[01]?[0-9])([0-5][0-9])';
        var customFloor = function (value, roundTo) {
          return Math.floor(value / psInputConfig.minuteStep) * psInputConfig.minuteStep;
        };
        var timeTest12hr = new RegExp('^' + temp12hr + '$', ['i']),
          timeTest12noColon = new RegExp('^' + temp12noColon + '$', ['i']),
          timeTest24hr = new RegExp('^' + temp24hr + '$', ['i']),
          timeTest24noColon = new RegExp('^' + temp24noColon + '$', ['i']),
          timeTest12hr2 = new RegExp('^' + temp12hr2 + '$', ['i']);
        return {
          restrict: "A",
          require: '?^ngModel',
          scope: {},
          link: function (scope, element, attrs, ngModel) {
            if (!ngModel) return; // do nothing if no ng-model

            ngModel.$render = function () {
              element.val(formatter(ngModel.$modelValue));
            };

            var minuteStep = getValue(attrs.minuteStep, psInputTimeConfig.minuteStep),
              fixedDay = getValue(attrs.fixedDay, psInputTimeConfig.fixedDay),
              timeFormat = attrs.format || psInputTimeConfig.format,
              maxDate = null,
              minDate = null;

            function getValue(value, defaultValue) {
              return angular.isDefined(value) ? scope.$parent.$eval(value) : defaultValue;
            }

            if (attrs.min || attrs.max) {
              fixedDay = false;
            }

            function checkMinMaxValid() {
              if (minDate !== null && ngModel.$modelValue < minDate) {
                ngModel.$setValidity('time-min', false);
              } else if (minDate !== null) ngModel.$setValidity('time-min', true);

              if (maxDate !== null && ngModel.$modelValue > maxDate) {
                ngModel.$setValidity('time-max', false);
              } else if (maxDate !== null) ngModel.$setValidity('time-max', true);

            }

            if (attrs.max) {
              scope.$parent.$watch($parse(attrs.max), function (value) {
                maxDate = value ? new Date(value) : null;
                checkMinMaxValid();
              });
            }

            if (attrs.min) {
              scope.$parent.$watch($parse(attrs.min), function (value) {
                minDate = value ? new Date(value) : null;
                checkMinMaxValid();
              });
            }

            var reservedKey = false;

            element.on('keydown', function (e) {

              reservedKey = false;
              switch (e.keyCode) {
                case 37:
                  // left button hit
                  tabBackward(e);
                  break;
                case 38:
                  // up button hit
                  addTime();
                  break;
                case 39:
                  // right button hit
                  tabForward(e);
                  break;
                case 40:
                  // down button hit
                  subtractTime();
                  break;
                case 9:
                  // TAB
                  if (e.shiftKey) {
                    if (getSelectionPoint() != 'hour') {
                      reservedKey = true;
                      tabBackward(e);
                    }
                  } else {
                    if (getSelectionPoint() != 'meridian') {
                      reservedKey = true;
                      tabForward(e);
                    }
                  }
                  break;
              }

              setTimeout(function () {
                var verified = false;
                switch (e.keyCode) {
                  case 37:
                    // left button hit
                    if (verifyFormat()) {
                      verified = true;
                      reservedKey = true;
                    }
                    break;
                  case 38:
                    // up button hit
                    if (verifyFormat()) {
                      verified = true;
                      reservedKey = true;
                    }
                    break;
                  case 39:
                    // right button hit
                    if (verifyFormat()) {
                      verified = true;
                      reservedKey = true;
                    }
                    break;
                  case 40:
                    // down button hit
                    if (verifyFormat()) {
                      verified = true;
                      reservedKey = true;
                    }
                    break;
                  case 9:
                    // TAB
                    if (verifyFormat()) {
                      verified = true;
                    }
                    break;
                  default:
                    // this is the value after the keypress
                    var afterVal = element.val();

                    if (afterVal.length > 7) {
                      verified = false;
                    } else if (afterVal.length === 7) {
                      if (timeTest12hr.test(afterVal)) {
                        verified = true;
                      } else {
                        verified = false;
                      }
                    } else {
                      if(timeTest12hr2.test(afterVal)){
                        verified = true;
                      } else {
                        verified = false;
                      }
                    }
                    //e.preventDefault();
                    break;
                }
                if (!verified) {
                  element.val(formatter(ngModel.$modelValue));
                } else{
                  ngModel.$setViewValue(createDateFromTime(element.val(), ngModel.$modelValue));
                }
              }, 0);
              if (reservedKey) {
                e.preventDefault();
              }
            }).on('blur', function () {
              setTimeout(function () {
                if (checkTimeFormat(element.val()) != 'invalid' && !reservedKey) {
                  scope.$apply(function () {
                    ngModel.$setViewValue(createDateFromTime(element.val(), ngModel.$modelValue));
                  });
                } else {
                  element.val(formatter(ngModel.$modelValue));
                }

              }, 0);

            }).on('click', function () {

              selectTime(getSelectionPoint());

            });

            function verifyFormat() {
              if (checkTimeFormat(element.val()) == '12hr')
                return true;
              else if (element.val() === '') {
                element.val(formatter(getDefaultDate()));
                ngModel.$setViewValue(getDefaultDate());
                setTimeout(function () {
                  selectTime('hour');
                }, 0);
                return true;
              }
              else if (checkTimeFormat(element.val()) != 'invalid') {
                element.val(formatter(ngModel.$modelValue));
                ngModel.$setViewValue(getDefaultDate());
                setTimeout(function () {
                  selectTime('hour');
                }, 0);
                return true;
              } else return false;
            }

            function selectTime(part) {
              if (part == 'hour') {
                setTimeout(function () {
                  element[0].setSelectionRange(0, 2);
                }, 0);
             } else if (part == 'minute') {
                setTimeout(function () {
                  element[0].setSelectionRange(3, 5);
                }, 0);
              } else {
                setTimeout(function () {
                  element[0].setSelectionRange(5, 7);
                }, 0);
              }
            }

            function getSelectionPoint() {
              var pos = element.prop("selectionStart");
              if (element.val().length < 1) {
                return 'hour';
              }
              if (pos < 3) {
                return 'hour';
              } else if (pos < 5) {
                return 'minute';
              } else if (pos < 8) {
                return 'meridian';
              } else return 'unknown';
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

            function getDefaultDate() {
              if (minDate !== null) return new Date(minDate);
              else if (maxDate !== null) return new Date(maxDate);
              else return new Date();
            }

            function parser(value) {

              if (value) {
                if (angular.isDate(value)) {
                  checkMinMaxValid();
                  ngModel.$setValidity('time', true);

                  if (minDate !== null && value < minDate) value = new Date(minDate);
                  if (maxDate !== null && value > maxDate) value = new Date(maxDate);

                  return value;

                } else {

                  ngModel.$setValidity('time', false);
                  return ngModel.$modelValue;
                }

              }

            }

            ngModel.$parsers.push(parser);

            function formatter(value) {

              if (value) {
                return $filter('date')(value, timeFormat);
              }
            }

            ngModel.$formatters.push(formatter);

            function createDateFromTime(time, cdate) {
              if (isNaN(cdate)) {
                cdate = getDefaultDate();
              }
              var ct = checkTimeFormat(time),
                minutes, hours, ampm, sHours, sMinutes;
              if (ct == '12hr') {
                hours = Number(time.match(/^(\d+)/)[1]);
                minutes = Number(time.match(/:(\d+)/)[1]);
                AMPM = time.match(/[apAP][mM]/)[0];
                if (AMPM.toUpperCase() == "PM" && hours < 12) hours = hours + 12;
                if (AMPM.toUpperCase() == "AM" && hours == 12) hours = hours - 12;
              } else if (ct == '24hr') {
                hours = time.split(/[;:]/)[0];
                minutes = time.split(/[;:]/)[1];
              } else if (ct == '24nc') {
                hours = time.length == 4 ? time.substr(0, 2) : time.substr(0, 1);
                minutes = time.substr(-2);
              } else if (ct == '12nc') {
                timeAsNumber = Number(time.match(/^(\d+)/)[1]).toString();
                hours = timeAsNumber.length == 4 ? Number(timeAsNumber.substr(0, 2)) : Number(
                  timeAsNumber.substr(0, 1));
                minutes = Number(timeAsNumber.substr(-2));
                AMPM = time.match(/[apAP][mM]/)[0];
                if (AMPM.toUpperCase() == "PM" && hours < 12) hours = hours + 12;
                if (AMPM.toUpperCase() == "AM" && hours == 12) hours = hours - 12;
              } else {
                return 'invalid';
              }
              sHours = hours.toString();
              sMinutes = minutes.toString();
              console.log('sMinutes', sMinutes, 'sHours', sHours);
              if (hours < 10) sHours = "0" + sHours;
              if (minutes < 10) sMinutes = "0" + sMinutes;
              cdate.setHours(sHours, sMinutes);
              return new Date(cdate);
            }

            function checkTimeFormat(value) {
              if (timeTest12hr.test(value)) return '12hr';
              else if (timeTest24hr.test(value)) return '24hr';
              else if (timeTest24noColon.test(value)) return '24nc';
              else if (timeTest12noColon.test(value)) return '12nc';
              else return 'invalid';
            }


            function addTime() {
              var cPoint = getSelectionPoint();
              if (cPoint == 'hour') {
                addMinutes(60);
              } else if (cPoint == 'minute') {
                addMinutes(minuteStep);
              } else if (cPoint == 'meridian') {
                if ((ngModel.$modelValue ? ngModel.$modelValue : getDefaultDate()).getHours > 12) {
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
                if ((ngModel.$modelValue ? ngModel.$modelValue : getDefaultDate()).getHours > 12) {
                  addMinutes(720);
                } else {
                  addMinutes(-720);
                }
              }
              selectTime(cPoint);
            }

            function addMinutes(minutes) {
              selected = ngModel.$modelValue ? new Date(ngModel.$modelValue) : getDefaultDate();
              dt = new Date(selected.getTime() + minutes * 60000);
              if (fixedDay === true || fixedDay == 'true') {
                dt = selected.setHours(dt.getHours(), dt.getMinutes());
                dt = new Date(dt);
              }
              scope.$apply(function () {
                ngModel.$setViewValue(dt);
              });
              element.val(formatter(ngModel.$modelValue));
            }

          }
        };
      }]);
