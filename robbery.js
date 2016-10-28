'use strict';

/**
 * Сделано задание на звездочку
 * Реализовано оба метода и tryLater
 */

exports.isStar = true;


var SEC_IN_MIN = 60;
var MIN_IN_HOUR = 60;
var MILLISECONDS = 1000;
var DAY_LIMIT = 3;
var WORK_DAYS = {
    'ВС': 'Sun, 4 Jan 1970 ',
    'ПН': 'Mon, 5 Jan 1970 ',
    'ВТ': 'Tue, 6 Jan 1970 ',
    'СР': 'Wed, 7 Jan 1970 ',
    'ЧТ': 'Thu, 8 Jan 1970 ',
    'ПТ': 'Fri, 9 Jan 1970 ',
    'СБ': 'Sat, 10 Jan 1970 '
};
var TIME_REG = /([0-1][0-9]|2[0-3]):([0-5][0-9])\+(\d+)/;

function extractDay(timeString) {
    var reg = /ВС|ПН|ВТ|СР|ЧТ|ПТ|СБ/g;
    var day = reg.exec(timeString)[0];

    return WORK_DAYS[day];
}

function extractZone(timeString) {

    return TIME_REG.exec(timeString)[3];
}

function extractTime(timeString) {
    var time = TIME_REG.exec(timeString);

    return time[1] + ':' + time[2];

}

function asTimeStamp(timeString, day) {
    if (day === undefined) {
        day = extractDay(timeString);
    }

    var time = extractTime(timeString);
    var zone = extractZone(timeString);

    if (zone.length === 1) {
        zone = '0' + zone;
    }

    var stdTimeString = day + time + ' +' + zone + '00';

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

function gangsterIsFree(interval, gangsterSchedule) {
    for (var i = 0; i < gangsterSchedule.length; i++) {
        if (overlap(gangsterInterval(gangsterSchedule[i]), interval)) {

            return false;
        }
    }

    return true;
}

function teamIsFree(interval, schedule) {
    var gangsters = Object.keys(schedule);
    var teamIsReady = true;
    gangsters.forEach(function (gangster) {
        if (!gangsterIsFree(interval, schedule[gangster])) {

            teamIsReady = false;
        }
    });

    return teamIsReady;
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

    var timesForRobbery = [];
    if (findRobberyTime()) {
        timesForRobbery = findRobberyTime();
    }

    // ищет подходящее время для начала операции в указанный день
    function findTodayTime(day) {
        var suitableTimes = [];
        var bankWorkHours = bankDailyInterval(day, workingHours);
        var operationStart = bankWorkHours[0];
        var operationEnd = operationStart + duration * SEC_IN_MIN * MILLISECONDS;
        var dailyDeadline = bankWorkHours[1];
        while (operationEnd <= dailyDeadline) {
            if (teamIsFree([operationStart, operationEnd], schedule)) {

                suitableTimes.push(operationStart);
            }
            operationStart += SEC_IN_MIN * MILLISECONDS;
            operationEnd += SEC_IN_MIN * MILLISECONDS;
        }

        return suitableTimes;
    }

    function findRobberyTime() {
        var suitableTimes = [];
        var day;
        var days = Object.keys(WORK_DAYS);
        for (var i = 0; i < DAY_LIMIT; i++) {
            day = WORK_DAYS[days[i + 1]];
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
            return timesForRobbery.length > 0;
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
            var stampGoTime = timesForRobbery[0];
            var zone = parseInt(extractZone(workingHours.from));
            var goTime = new Date(stampGoTime + zone * MIN_IN_HOUR * SEC_IN_MIN * MILLISECONDS);
            var hh = goTime.getUTCHours();
            var mm = goTime.getUTCMinutes();
            var dd = Object.keys(WORK_DAYS)[goTime.getUTCDay()];

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
            if (!this.exists() || timesForRobbery.length < 2) {

                return false;
            }

            var difference = 30 * SEC_IN_MIN * MILLISECONDS;
            for (var i = 0; i < timesForRobbery.length; i++) {
                if (timesForRobbery[i] - timesForRobbery[0] >= difference) {
                    timesForRobbery.splice(0, i);

                    return true;
                }
            }

            return false;

        }
    };
};
