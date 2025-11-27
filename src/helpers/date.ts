// src/helpers/date.ts
import dayjs from "../lib/dayjs-config";

// Obtém a data e hora atuais no fuso horário UTC
export const getCurrentUTC = () => dayjs().utc().toDate();
export const toUTCDate = (date: Date | string) => dayjs(date).utc().toDate();

// Formata uma data para exibição no formato brasileiro (DD/MM/YYYY)
export const formatDateForDisplay = (date: Date | string) =>
  dayjs(date).tz("America/Sao_Paulo").format("DD/MM/YYYY");

// Formata uma data para exibição no formato brasileiro (DD/MM/YYYY HH:mm)
export const formatDateTimeForDisplay = (date: Date | string) =>
  dayjs(date).tz("America/Sao_Paulo").format("DD/MM/YYYY HH:mm");

// Formata uma data para exibição no formato brasileiro (HH:mm)
export const formatTimeForDisplay = (date: Date | string) =>
  dayjs(date).tz("America/Sao_Paulo").format("HH:mm");

// Cria uma data no fuso horário local
export const createLocalDate = (date?: Date | string) =>
  date ? dayjs(date).tz("America/Sao_Paulo") : dayjs().tz("America/Sao_Paulo");

// ✅ Funções para busca considerando UTC
export const createSearchDateRangeUTC = (startDate: Date, endDate: Date) => {
  // Converte datas locais para UTC para busca no banco
  const startUTC = dayjs(startDate)
    .tz("America/Sao_Paulo")
    .startOf("day")
    .utc()
    .toDate();
  const endUTC = dayjs(endDate)
    .tz("America/Sao_Paulo")
    .endOf("day")
    .utc()
    .toDate();
  return { startUTC, endUTC };
};

export const createSearchDateUTC = (date: Date) => {
  // Converte data local para UTC para busca no banco
  return dayjs(date).tz("America/Sao_Paulo").utc().toDate();
};

export const createSearchStartOfDayUTC = (date: Date) => {
  // Converte início do dia local para UTC
  return dayjs(date).tz("America/Sao_Paulo").startOf("day").utc().toDate();
};

export const createSearchEndOfDayUTC = (date: Date) => {
  // Converte fim do dia local para UTC
  return dayjs(date).tz("America/Sao_Paulo").endOf("day").utc().toDate();
};
