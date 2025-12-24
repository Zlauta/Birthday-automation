import { MONTH_NAMES } from "@/utils/constants.js";

export const isBirthdayToday = (birthdayValue) => {
  if (!birthdayValue) return false;

  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth() + 1;

  const dateParts = birthdayValue
    .split(/[/ -]/)
    .map((partString) => parseInt(partString, 10));

  const [firstValue, secondValue] = dateParts;

  const matchesAsDayMonth =
    firstValue === currentDay && secondValue === currentMonth;
  const matchesAsMonthDay =
    firstValue === currentMonth && secondValue === currentDay;

  return matchesAsDayMonth || matchesAsMonthDay;
};

export const parseBirthdayForBanner = (birthdayValue) => {
  const today = new Date();
  const currentDayNum = today.getDate();
  const currentMonthNum = today.getMonth() + 1;

  const dateParts = birthdayValue
    .split(/[/ -]/)
    .map((part) => parseInt(part, 10));

  const [firstValue, secondValue] = dateParts;

  let day;
  let monthIndex;

  if (firstValue === currentDayNum && secondValue === currentMonthNum) {
    day = firstValue;
    monthIndex = secondValue - 1;
  } else {
    day = secondValue;
    monthIndex = firstValue - 1;
  }

  return {
    day: day.toString(),
    monthName: MONTH_NAMES[monthIndex] || "Enero",
  };
};
