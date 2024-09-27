const YOUR_PUBLIC_VAPID_KEY =
  "BFVGMWw3j6V3EHw9ulQRNNPRd0taFpzWW5zBxId6HoWIxk8xYNNYoXmfyPFoKJt0lwuYoLBnUZiJLKJBb1tliA8";

if ("serviceWorker" in navigator && "PushManager" in window) {
  navigator.serviceWorker
    .register("/service-worker.js")
    .then(function (swReg) {
      console.log("Service Worker is registered", swReg);
      initializePushNotifications(swReg);
    })
    .catch(function (error) {
      console.error("Service Worker Error", error);
    });
}

function initializePushNotifications(swReg) {
  // Request notification permission
  if (Notification.permission !== "granted") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        subscribeUser(swReg);
      }
    });
  } else {
    subscribeUser(swReg);
  }
}

function subscribeUser(swReg) {
  const applicationServerKey = urlB64ToUint8Array(YOUR_PUBLIC_VAPID_KEY);
  swReg.pushManager
    .subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey,
    })
    .then(function (subscription) {
      console.log("User is subscribed:", subscription);
      sendSubscriptionToServer(subscription);
    })
    .catch(function (err) {
      console.log("Failed to subscribe the user: ", err);
    });
}

function sendSubscriptionToServer(subscription) {
  // Send the subscription details to your server
  fetch("http://localhost:3000/subscribe", {
    method: "POST",
    body: JSON.stringify(subscription),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then(function (response) {
      if (!response.ok) {
        throw new Error("Bad status code from server.");
      }
      return response.json();
    })
    .then(function (responseData) {
      if (!(responseData && responseData.success)) {
        throw new Error("Bad response from server.");
      }
    });
}

function urlB64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

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
    if (currentDay !== -1) {
      const dayHeader = scheduleTable.querySelector(
        `th:nth-child(${currentDay + 2})`
      );
      dayHeader.classList.add("current-day");
    }
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

      // Only highlight if the cell has content
      timeSlotHeader.classList.add("current-time");
      if (timeSlotCell && timeSlotCell.textContent.trim() !== "") {
        timeSlotCell.classList.add("current-time");
      } else {
        timeSlotCell.classList.add("static-color");
      }
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

function updateTime() {
  // Create a new Date object
  let currentDate = new Date();

  // Get the current time (hours, minutes, and seconds)
  let hours = currentDate.getHours();
  let minutes = currentDate.getMinutes();
  let seconds = currentDate.getSeconds();

  // Format time to be more readable (e.g., 09:05:09 instead of 9:5:9)
  hours = hours < 10 ? "0" + hours : hours;
  minutes = minutes < 10 ? "0" + minutes : minutes;
  seconds = seconds < 10 ? "0" + seconds : seconds;

  let time = hours + ":" + minutes + ":" + seconds;

  // Get the current day (0 = Sunday, 1 = Monday, etc.)
  let days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  let day = days[currentDate.getDay()];

  // Get the current date (day of the month, month, year)
  let date = currentDate.getDate();
  let month = currentDate.getMonth() + 1; // Months are zero-based
  let year = currentDate.getFullYear();

  // Format the date to be more readable (e.g., 09/08/2024 instead of 9/8/2024)
  date = date < 10 ? "0" + date : date;
  month = month < 10 ? "0" + month : month;

  let fullDate = date + "/" + month + "/" + year;

  // Combine the time, day, and date into a single string
  let dateTimeString = time + " | " + day + " | " + fullDate;

  // Update the content of the element with id "current-date-time"
  let currentDateTimeContainer = document.getElementById(
    "current-date-time-container"
  );
  let currentTimeElement = document.getElementById("current-time");
  let currentDayElement = document.getElementById("current-day");
  let currentDateElement = document.getElementById("current-date");

  currentTimeElement.innerText = time;
  currentDayElement.innerText = day;
  currentDateElement.innerText = fullDate;

  // Change background color if the day is Saturday or Sunday
  if (day === "Sat" || day === "Sun") {
    currentDateTimeContainer.style.backgroundColor = "rgb(212, 86, 28)";
  } else {
    // Reset to default if not
    currentDateTimeContainer.style.backgroundColor = "rgb(103, 138, 32)";
  }
}

// Update the time every second
setInterval(updateTime, 1000);
