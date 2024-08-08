// script.js
document.addEventListener("DOMContentLoaded", () => {
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const scheduleTable = document.getElementById("schedule");

  function getCurrentIST() {
    // Convert the current time to UTC
    const now = new Date();
    const utcOffset = now.getTimezoneOffset() * 60000;
    const utcTime = now.getTime() + utcOffset;

    // IST is UTC + 5:30
    const istOffset = 5.5 * 3600000;
    return new Date(utcTime + istOffset);
  }

  function getCurrentDay() {
    const now = getCurrentIST();
    console.log(now);
    console.log(now.getDay());
    return now.getDay() - 1;
  }

  function getCurrentTimeSlot() {
    const now = getCurrentIST();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const timeSlots = [
      "09:00 - 10:00",
      "10:00 - 11:00",
      "11:00 - 12:00",
      "12:00 - 13:00",
      "13:00 - 14:00",
      "14:00 - 15:00",
      "15:00 - 16:00",
      "16:00 - 17:00",
    ];

    // Find the matching time slot
    for (let i = 0; i < timeSlots.length; i++) {
      const [start, end] = timeSlots[i].split(" - ");
      const [startHours, startMinutes] = start.split(":").map(Number);
      const [endHours, endMinutes] = end.split(":").map(Number);

      if (
        (hours > startHours ||
          (hours === startHours && minutes >= startMinutes)) &&
        (hours < endHours || (hours === endHours && minutes <= endMinutes))
      ) {
        return i;
      }
    }

    return -1;
  }

  function highlightCurrentDay() {
    const currentDay = getCurrentDay();
    const dayHeader = scheduleTable.querySelector(
      `th:nth-child(${currentDay + 2})`
    );
    dayHeader.classList.add("current-day");
  }

  function highlightCurrentTimeSlot() {
    const currentTimeSlot = getCurrentTimeSlot();
    if (currentTimeSlot !== -1) {
      const currentDay = getCurrentDay();
      const timeSlotCell = scheduleTable.querySelector(
        `tbody tr:nth-child(${currentTimeSlot + 1}) td:nth-child(${
          currentDay + 2
        })`
      );
      const timeSlotHeader = scheduleTable.querySelector(
        `tbody tr:nth-child(${currentTimeSlot + 1}) td:first-child`
      );
      timeSlotCell.classList.add("current-time");
      timeSlotHeader.classList.add("current-time");
    }
  }

  highlightCurrentDay();
  highlightCurrentTimeSlot();

  // Update the highlights every minute
  setInterval(() => {
    document
      .querySelectorAll(".current-time")
      .forEach((cell) => cell.classList.remove("current-time"));
    highlightCurrentTimeSlot();
  }, 60000); // 60000 milliseconds = 1 minute
});
