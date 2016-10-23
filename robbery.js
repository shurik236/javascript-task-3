'use strict';

/**
 * Сделано задание на звездочку
 * Реализовано оба метода и tryLater
 */

exports.isStar = true;


var SEC_IN_MIN = 60;
var SUNDAY = 'Sun, 4 Jan 1970 ';
var MONDAY = 'Mon, 5 Jan 1970 ';
var TUESDAY = 'Tue, 6 Jan 1970 ';
var WEDNESDAY = 'Wed, 7 Jan 1970 ';
var THURSDAY = 'Thu, 8 Jan 1970 ';
var FRIDAY = 'Fri, 9 Jan 1970 ';
var SATURDAY = 'Sat, 10 Jan 1970 ';
var WORK_DAYS = {
    'ВС': SUNDAY,
    'ПН': MONDAY,
    'ВТ': TUESDAY,
    'СР': WEDNESDAY,
    'ЧТ': THURSDAY,
    'ПТ': FRIDAY,
    'СБ': SATURDAY
};
var GANGSTERS = ['Danny', 'Rusty', 'Linus'];

function extractDay(timeString) {
    var reg = /ВС|ПН|ВТ|СР|ЧТ/g;
    var day = reg.exec(timeString)[0];

    return WORK_DAYS[day];
}

function extractZone(timeString) {
    var reg = /[0-2][0-9]:[0-5][0-9]\+(\d+)/g;

    return reg.exec(timeString)[1];
}

function asTimeStamp(timeString, day) {
    if (day === undefined) {
        day = extractDay(timeString);
    }

    var reg = /([0-2][0-9]):([0-5][0-9])\+(\d+)/g;
    var time = reg.exec(timeString);
    var zone = time[3];

    if (zone.length === 1) {
        zone = '0' + zone;
    }

    var stdTimeString = day + time[1] + ':' + time[2] + ':00 +' + zone + '00';

    return Date.parse(stdTimeString);
}

function overlap(rangeA, rangeB) {

    return (rangeA[0] < rangeB[1]) && (rangeB[0] < rangeA[1]);
}

function bankDailyInterval(day, entry) {

    return [asTimeStamp(entry.from, day), asTimeStamp(entry.to, day)];
}

function gangsterInterval(entry) {

    return [asTimeStamp(entry.from), asTimeStamp(entry.to)];
}

function scheduleFitting(interval, gangsterSchedule) {

    for (var i = 0; i < gangsterSchedule.length; i++) {
        if (overlap(gangsterInterval(gangsterSchedule[i]), interval)) {

            return false;
        }
    }

    return true;
}

function goForIt(interval, schedule) {
    for (var i = 0; i < Object.keys(schedule).length; i++) {
        if (!scheduleFitting(interval, schedule[GANGSTERS[i]])) {

            return false;
        }
    }

    return true;
}

function zeroPadded(number) {
    if (number < 10) {

        return '0' + number;
    }

    return String(number);
}

/**
 * @param {Object} schedule – Расписание Банды
 * @param {Number} duration - Время на ограбление в минутах
 * @param {Object} workingHours – Время работы банка
 * @param {String} workingHours.from – Время открытия, например, "10:00+5"
 * @param {String} workingHours.to – Время закрытия, например, "18:00+5"
 * @returns {Object}
 */
exports.getAppropriateMoment = function (schedule, duration, workingHours) {
    console.info(schedule, duration, workingHours);

    var timesForTheJob = [];
    if (findTime()) {
        timesForTheJob = findTime();
    }

    // ищет подходящее время для начала операции в указанный день
    function findTodayTime(day) {
        var suitableTimes = [];
        var bankWorkHours = bankDailyInterval(day, workingHours);
        var operationStart = bankWorkHours[0];
        var operationEnd = operationStart + duration * SEC_IN_MIN * 1000;
        var dailyDeadline = bankWorkHours[1];
        while (operationEnd <= dailyDeadline) {
            if (goForIt([operationStart, operationEnd], schedule)) {

                suitableTimes.push(operationStart);
            }
            operationStart += SEC_IN_MIN * 1000;
            operationEnd += SEC_IN_MIN * 1000;
        }

        return suitableTimes;
    }

    function findTime() {
        var suitableTimes = [];
        var day;
        var days = Object.keys(WORK_DAYS);
        for (var i = 1; i < 4; i++) {
            day = WORK_DAYS[days[i]];
            suitableTimes = suitableTimes.concat(findTodayTime(day));
        }

        if (suitableTimes.length > 0) {

            return suitableTimes;
        }

        return false;
    }


    return {

        /**
         * Найдено ли время
         * @returns {Boolean}
         */
        exists: function () {
            return (timesForTheJob.length > 0);
        },

        /**
         * Возвращает отформатированную строку с часами для ограбления
         * Например,
         *   "Начинаем в %HH:%MM (%DD)" -> "Начинаем в 14:59 (СР)"
         * @param {String} template
         * @returns {String}
         */
        format: function (template) {
            if (!this.exists()) {

                return '';
            }
            var stampGoTime = timesForTheJob[0];
            var zone = parseInt(extractZone(workingHours.from));
            var goTime = new Date(stampGoTime + zone * 60 * SEC_IN_MIN * 1000);
            var hh = goTime.getHours();
            var mm = goTime.getMinutes();
            var dd = Object.keys(WORK_DAYS)[goTime.getDay()];

            return template
                .replace('%HH', zeroPadded(hh))
                .replace('%MM', zeroPadded(mm))
                .replace('%DD', dd);
        },

        /**
         * Попробовать найти часы для ограбления позже [*]
         * @star
         * @returns {Boolean}
         */
        tryLater: function () {
            if (!this.exists() || timesForTheJob.length < 2) {

                return false;
            }

            var difference = 30 * SEC_IN_MIN * 1000;
            for (var i = 0; i < timesForTheJob.length; i++) {
                if (timesForTheJob[i] - timesForTheJob[0] >= difference) {
                    timesForTheJob.splice(0, i);

                    return true;
                }
            }

            return false;

        }
    };
};
