import { extractApiErrorMessage as extractGenericApiErrorMessage } from "@/lib/helpers/api";
import type {
  SchedulingRuleDto,
  SchedulingRuleFormValues,
  SchedulingRulePayload,
  SettingsTab,
} from "@/types/owner-settings";

type ApiErrorResponse = {
  error?: {
    details?: unknown;
  };
};

export const DEFAULT_START_TIME = "09:00";
export const DEFAULT_END_TIME = "19:00";
export const DEFAULT_SESSION_DURATION = "60";
export const DEFAULT_WEEK_DAYS = [0, 1, 2, 3, 4, 5, 6];

export const WEEK_DAY_OPTIONS = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Segunda" },
  { value: 2, label: "Terça" },
  { value: 3, label: "Quarta" },
  { value: 4, label: "Quinta" },
  { value: 5, label: "Sexta" },
  { value: 6, label: "Sábado" },
];

export function normalizeTimeValue(value?: string | null) {
  if (!value) {
    return "";
  }

  const match = value.match(/(\d{2}):(\d{2})/);
  if (!match) {
    return "";
  }

  return `${match[1]}:${match[2]}`;
}

export function normalizeDateValue(value?: string | null) {
  if (!value) {
    return "";
  }

  const match = value.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (!match) {
    return "";
  }

  return `${match[1]}-${match[2]}-${match[3]}`;
}

export function parseDateInputValue(value: string) {
  if (!value) {
    return undefined;
  }

  const [year, month, day] = value.split("-").map((item) => Number(item));
  if (![year, month, day].every(Number.isInteger)) {
    return undefined;
  }

  const parsedDate = new Date(year, month - 1, day);
  if (Number.isNaN(parsedDate.getTime())) {
    return undefined;
  }

  return parsedDate;
}

export function formatDateInputValue(value: Date | undefined) {
  if (!value) {
    return "";
  }

  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function normalizeWeekDays(value?: Array<number | string> | null) {
  if (!value || value.length === 0) {
    return DEFAULT_WEEK_DAYS;
  }

  const normalized = value
    .map((day) => Number(day))
    .filter((day) => Number.isInteger(day) && day >= 0 && day <= 6);

  if (normalized.length === 0) {
    return DEFAULT_WEEK_DAYS;
  }

  return Array.from(new Set(normalized)).sort((a, b) => a - b);
}

export function extractOwnerSettingsApiErrorMessage(error: unknown, fallback: string) {
  const defaultMessage = extractGenericApiErrorMessage(error, fallback);
  if (defaultMessage !== fallback) {
    return defaultMessage;
  }

  if (error && typeof error === "object") {
    const payload = error as ApiErrorResponse;

    if (payload.error?.details && typeof payload.error.details === "object") {
      const detailsValues = Object.values(payload.error.details as Record<string, unknown>);

      for (const value of detailsValues) {
        if (Array.isArray(value) && value.length > 0) {
          const first = value[0];
          if (typeof first === "string" && first.trim().length > 0) {
            return first;
          }
        }

        if (value && typeof value === "object") {
          const nestedValues = Object.values(value as Record<string, unknown>);
          for (const nestedValue of nestedValues) {
            if (Array.isArray(nestedValue) && nestedValue.length > 0) {
              const firstNested = nestedValue[0];
              if (typeof firstNested === "string" && firstNested.trim().length > 0) {
                return firstNested;
              }
            }
          }
        }
      }
    }
  }

  return fallback;
}

export function parseSchedulingRuleToForm(rule: SchedulingRuleDto): SchedulingRuleFormValues {
  return {
    startTime: normalizeTimeValue(rule.start_time) || DEFAULT_START_TIME,
    endTime: normalizeTimeValue(rule.end_time) || DEFAULT_END_TIME,
    sessionDuration:
      typeof rule.session_duration_minutes === "number"
        ? String(rule.session_duration_minutes)
        : DEFAULT_SESSION_DURATION,
    weekDays: normalizeWeekDays(rule.week_days),
    startDate: normalizeDateValue(rule.start_date),
    endDate: normalizeDateValue(rule.end_date),
  };
}

export function buildSchedulingRulePayload({
  startTime,
  endTime,
  sessionDuration,
  selectedWeekDays,
  startDate,
  endDate,
}: {
  startTime: string;
  endTime: string;
  sessionDuration: string;
  selectedWeekDays: number[];
  startDate: string;
  endDate: string;
}): SchedulingRulePayload {
  const payload: SchedulingRulePayload = {
    start_time: startTime,
    end_time: endTime,
    session_duration_minutes: Number(sessionDuration),
    week_days: [...selectedWeekDays].sort((a, b) => a - b),
  };

  if (startDate) {
    payload.start_date = startDate;
  }

  if (endDate) {
    payload.end_date = endDate;
  }

  return payload;
}

export function validateDiaryForm({
  diaryTitle,
  diaryDescription,
}: {
  diaryTitle: string;
  diaryDescription: string;
}) {
  if (!diaryTitle.trim()) {
    return "Informe o título da agenda.";
  }

  if (!diaryDescription.trim() || diaryDescription.trim().length < 10) {
    return "A descrição da agenda precisa ter pelo menos 10 caracteres.";
  }

  return null;
}

export function validateSchedulingForm({
  startTime,
  endTime,
  sessionDuration,
  selectedWeekDays,
  startDate,
  endDate,
}: {
  startTime: string;
  endTime: string;
  sessionDuration: string;
  selectedWeekDays: number[];
  startDate: string;
  endDate: string;
}) {
  if (!startTime || !endTime) {
    return "Informe horário de início e fim.";
  }

  if (endTime <= startTime) {
    return "O horário final precisa ser maior que o horário inicial.";
  }

  const duration = Number(sessionDuration);
  if (!Number.isInteger(duration) || duration <= 0) {
    return "A duração da sessão deve ser um número inteiro maior que zero.";
  }

  if (duration % 15 !== 0) {
    return "A duração da sessão deve ser múltipla de 15 minutos.";
  }

  if (selectedWeekDays.length === 0) {
    return "Selecione ao menos um dia da semana.";
  }

  if (startDate && endDate && endDate < startDate) {
    return "A data final deve ser igual ou maior que a data inicial.";
  }

  return null;
}

export function getOwnerSettingsPageTitle(hasDiary: boolean, hasSchedulingRule: boolean) {
  if (!hasDiary) {
    return "Criar funcionamento da agenda";
  }

  if (!hasSchedulingRule) {
    return "Adicionar funcionamento da agenda";
  }

  return "Editar funcionamento da agenda";
}

export function getOwnerSettingsTabButtonClass(activeTab: SettingsTab, tab: SettingsTab) {
  return [
    "inline-flex items-end border-b-2 border-transparent bg-transparent px-0 pb-px text-sm leading-none font-medium [font-family:var(--rationale-font)] transition-colors disabled:opacity-50",
    activeTab === tab ? "border-b-primary text-primary" : "text-muted-foreground hover:text-foreground",
  ].join(" ");
}

