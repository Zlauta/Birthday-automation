export const isBirthdayToday = (birthdayValue) => {
    if (!birthdayValue) return false;

    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth() + 1;

    const dateParts = birthdayValue
        .split(/[/ -]/)
        .map(partString => parseInt(partString, 10));

    const [firstValue, secondValue] = dateParts;

    const matchesAsDayMonth = (firstValue === currentDay && secondValue === currentMonth);
    const matchesAsMonthDay = (firstValue === currentMonth && secondValue === currentDay);

    return matchesAsDayMonth || matchesAsMonthDay;
};