
export default function convertTo12Hour(time24) {
if (!time24) return;
let [hoursString, minutesString] = time24.split(":");
let hours = parseInt(hoursString);

// Handle the edge case for "24:00"
if (hours === 24) {
    hours = 0;
}

const suffix = hours >= 12 ? "PM" : "AM";
hours = hours % 12 || 12;

return `${hours}:${minutesString} ${suffix}`;
}