import { parseISO, format } from "date-fns";
import { WeatherData } from "./test/data";
import { MaybeError, averageNumArray, isError } from "./helpers";

type Summary = {
  morning_average_temperature: number | string;
  morning_chance_of_rain: number | string;
  afternoon_average_temperature: number | string;
  afternoon_chance_of_rain: number | string;
  high_temperature: number;
  low_temperature: number;
};

const getAverageTemperature = (items: number[]): number | string => {
  const maybeValue = averageNumArray(items);
  return isError(maybeValue)
    ? "Insufficient forecast data"
    : Math.round(maybeValue);
};

const getChanceOfRain = (items: number[]): number | string => {
  const maybeValue = averageNumArray(items);
  return isError(maybeValue)
    ? "Insufficient forecast data"
    : Number(maybeValue.toFixed(2));
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

  // Process each day
  Object.keys(grpDay).forEach((day) => {
    const entries = grpDay[day];
    const tMorning: number[] = [];
    const rMorning: number[] = [];
    const tAfternoon: number[] = [];
    const rAfternoon: number[] = [];
    const tAll = entries.map((entry) => entry.average_temperature);

    entries.forEach((entry) => {
      const entryTime = parseISO(entry.date_time);
      const hour = entryTime.getHours();
      // Collect morning period entries
      if (6 <= hour && hour < 12) {
        tMorning.push(entry.average_temperature);
        rMorning.push(entry.probability_of_rain);
      }
      // Collect afternoon period entries
      else if (12 <= hour && hour < 18) {
        tAfternoon.push(entry.average_temperature);
        rAfternoon.push(entry.probability_of_rain);
      }
    });

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

