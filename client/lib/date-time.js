const numberToMonthMap = {
  0: "Jan",
  1: "Feb",
  2: "Mar",
  3: "Apr",
  4: "May",
  5: "Jun",
  6: "Jul",
  7: "Aug",
  8: "Sep",
  9: "Oct",
  10: "Nov",
  11: "Dec",
};

export const numberToMonthMapFull = {
  0: "january",
  1: "february",
  2: "march",
  3: "april",
  4: "may",
  5: "june",
  6: "july",
  7: "august",
  8: "september",
  9: "october",
  10: "november",
  11: "december",
};

export const monthToNumberMap = {
  january: 0,
  february: 1,
  march: 2,
  april: 3,
  may: 4,
  june: 5,
  july: 6,
  august: 7,
  september: 8,
  october: 9,
  november: 10,
  december: 11,
};

export const getHowLongAgo = (fullDate, long) => {
  const createdTimeMilliseconds = new Date(fullDate).getTime();
  const millisecondsNow = Date.now();

  const difference = millisecondsNow - createdTimeMilliseconds;
  const differenceInSeconds = Math.round(difference / 1000);

  let howLongAgo = "";

  if (differenceInSeconds < 60) {
    howLongAgo += "few moments";
  } else if (differenceInSeconds < 3600) {
    const minutes = Math.round(differenceInSeconds / 60);
    howLongAgo += `${minutes} ${
      long ? (minutes > 1 ? "minutes" : "minute") : "min"
    }`;
  } else if (differenceInSeconds < 86400) {
    const hours = Math.round(differenceInSeconds / 3600);
    howLongAgo += `${hours}${long ? (hours > 1 ? " hours" : " hour") : "hr"}`;
  } else if (differenceInSeconds < 604800) {
    const days = Math.round(differenceInSeconds / 86400);
    howLongAgo += `${days}${long ? (days > 1 ? " days" : " day") : "d"}`;
  } else {
    const weeks = Math.round(differenceInSeconds / 604800);
    howLongAgo += `${weeks}${long ? (weeks > 1 ? " weeks" : " week") : "w"}`;
  }

  return howLongAgo;
};

export const getDate = (fullDate) => {
  const date = new Date(fullDate);
  const dateString = `${date.getDate()} ${
    numberToMonthMap[date.getMonth()]
  }, ${date.getFullYear()}`;
  return dateString;
};

export const getTime = (fullDate) => {
  const date = new Date(fullDate);
  let hours = date.getHours();
  const minutes = date.getMinutes();
  let label = "am";

  if (hours > 12) {
    hours = hours - 12;
    label = "pm";
  }

  return `${hours < 10 ? `0${hours}` : hours}:${
    minutes < 10 ? `0${minutes}` : minutes
  } ${label}`;
};

export const getDateSections = (date) => {
  return [date.getFullYear(), date.getMonth(), date.getDate()];
};

export const getMessageTime = (fullDate) => {
  const msgDate = new Date(fullDate);
  const currentDate = new Date();

  const msgDateSections = getDateSections(msgDate);
  const currentDateSections = getDateSections(currentDate);

  // determine if the message was sent today
  let sameDate = true;

  for (let i = 0; i < 3; i++) {
    if (msgDateSections[i] !== currentDateSections[i]) {
      sameDate = false;
    }
  }

  if (sameDate) {
    // if the message was sent today, return only the time
    return getTime(msgDate);
  }

  if (currentDateSections[2] === msgDateSections[2] + 1) {
    // if the message was sent yesterday
    return `Yesterday, ${getTime(msgDate)}`;
  }

  return `${msgDateSections.join("-")}, ${getTime(msgDate)}`;
};

export const months = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];
