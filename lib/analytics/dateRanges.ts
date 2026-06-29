import { DateRange } from "./analyticsTypes";

export function last7Days(): DateRange {

  const end = new Date();

  const start = new Date();

  start.setDate(end.getDate() - 7);

  return {
    start,
    end,
  };
}

export function last30Days(): DateRange {

  const end = new Date();

  const start = new Date();

  start.setDate(end.getDate() - 30);

  return {
    start,
    end,
  };
}

export function previous30Days(): DateRange {

  const end = new Date();

  end.setDate(end.getDate() - 30);

  const start = new Date();

  start.setDate(end.getDate() - 30);

  return {
    start,
    end,
  };
}

export function thisMonth(): DateRange {

  const start = new Date();

  start.setDate(1);

  start.setHours(0,0,0,0);

  return {
    start,
    end: new Date(),
  };
}

export function previousMonth(): DateRange {

  const today = new Date();

  const start = new Date(
    today.getFullYear(),
    today.getMonth()-1,
    1
  );

  const end = new Date(
    today.getFullYear(),
    today.getMonth(),
    0,
    23,
    59,
    59
  );

  return {
    start,
    end,
  };
}