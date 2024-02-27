import { parseISO, format } from "date-fns";
import { WeatherData } from "./test/data";
import {
  MaybeError,
  averageNumArray,
  getAverageTemperature,
  getChanceOfRain,
  isBetweenHours,
  isError,
} from "./helpers";

type Summary = {
  morning_average_temperature: number | string;
  morning_chance_of_rain: number | string;
  afternoon_average_temperature: number | string;
  afternoon_chance_of_rain: number | string;
  high_temperature: number;
  low_temperature: number;
};

export function summarizeForecast(data: WeatherData[]) {
  const morningFilter = isBetweenHours(6, 12);
  if (isError(morningFilter)) {
    throw morningFilter;
  }

  const afternoonFilter = isBetweenHours(12, 18);
  if (isError(afternoonFilter)) {
    throw afternoonFilter;
  }

  const uniqueDates = [...new Set(data.map((e) => e.date_time.split("T")[0]))];

  const d = uniqueDates.map((date) => {
    const items = data.filter((e) => e.date_time.split("T")[0] === date);
    const morningItems = items.filter(morningFilter);
    const afternoonItems = items.filter(afternoonFilter);
  });

  const grpDay: Record<string, WeatherData[]> = {};

  // Group entries by day
  data.forEach((e) => {
    const entryTime = parseISO(e.date_time);
    const key = entryTime.toISOString().split("T")[0]; // Get date part only
    if (!grpDay[key]) {
      grpDay[key] = [];
    }
    grpDay[key].push(e);
  });

  const summaries: Record<string, Summary> = {};

  // Process each day
  Object.keys(grpDay).forEach((day) => {
    const items = grpDay[day];

    const morningItems = items.filter(morningFilter);
    const afternoonItems = items.filter(afternoonFilter);

    const tAll = items.map((entry) => entry.average_temperature);

    const summary: Summary = {
      morning_average_temperature: getAverageTemperature(morningItems),
      morning_chance_of_rain: getChanceOfRain(morningItems),
      afternoon_average_temperature: getAverageTemperature(afternoonItems),
      afternoon_chance_of_rain: getChanceOfRain(afternoonItems),
      high_temperature: Math.max(...tAll),
      low_temperature: Math.min(...tAll),
    };

    // Format reader-friendly date
    const dayName = format(parseISO(day), "EEEE MMMM dd").replace(" 0", " ");

    summaries[dayName] = summary;
  });

  return summaries;
}
