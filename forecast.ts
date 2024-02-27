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

  const morningFilter = isBetweenHours(6, 12);
  if (isError(morningFilter)) {
    throw morningFilter;
  }

  const afternoonFilter = isBetweenHours(12, 18);
  if (isError(afternoonFilter)) {
    throw afternoonFilter;
  }

  // Process each day
  Object.keys(grpDay).forEach((day) => {
    const items = grpDay[day];

    const morningItems = items.filter(morningFilter);
    const afternoonItems = items.filter(afternoonFilter);

    const tMorning: number[] = morningItems.map(
      (item) => item.average_temperature,
    );
    const rMorning: number[] = morningItems.map(
      (item) => item.probability_of_rain,
    );
    const tAfternoon: number[] = afternoonItems.map(
      (item) => item.average_temperature,
    );
    const rAfternoon: number[] = afternoonItems.map(
      (item) => item.probability_of_rain,
    );
    const tAll = items.map((entry) => entry.average_temperature);

    const summary: Summary = {
      morning_average_temperature: getAverageTemperature(tMorning),
      morning_chance_of_rain: getChanceOfRain(rMorning),
      afternoon_average_temperature: getAverageTemperature(tAfternoon),
      afternoon_chance_of_rain: getChanceOfRain(rAfternoon),
      high_temperature: Math.max(...tAll),
      low_temperature: Math.min(...tAll),
    };

    // Format reader-friendly date
    const dayName = format(parseISO(day), "EEEE MMMM dd").replace(" 0", " ");

    summaries[dayName] = summary;
  });

  return summaries;
}
