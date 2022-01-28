const { utcToZonedTime, format } = require("date-fns-tz");
const { formatDistanceToNow, differenceInDays } = require("date-fns");

function dateFormat(value, fmtstring = "yyyy-MM-dd") {
  let zonedDate = utcToZonedTime(value, "UTC");
  return format(zonedDate, fmtstring);
}

function strictIsoDateFormat(value) {
  return Date.toISOString();
}

function relativeDate(value) {
  return formatDistanceToNow(new Date(Number(value)), { addSuffix: true });
}

function dateOlderThan1y(value) {
  return differenceInDays(new Date(), new Date(Number(value))) > 365;
}

module.exports = {
  dateFormat,
  strictIsoDateFormat,
  relativeDate,
  dateOlderThan1y,
};
