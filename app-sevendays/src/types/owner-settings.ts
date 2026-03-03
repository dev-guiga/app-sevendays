export type OwnerDiaryResponse = {
  success?: boolean;
  diary_data?: {
    title?: string;
    description?: string;
  };
};

export type OwnerDiaryCreateResponse = {
  success?: boolean;
  diary?: {
    id?: number;
    title?: string;
    description?: string;
  };
  scheduling_rule?: SchedulingRuleDto;
};

export type OwnerDiaryUpdateResponse = {
  success?: boolean;
  diary?: {
    id?: number;
    title?: string;
    description?: string;
  };
};

export type SchedulingRuleDto = {
  id?: number;
  start_time?: string | null;
  end_time?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  session_duration_minutes?: number | null;
  week_days?: Array<number | string> | null;
};

export type OwnerSchedulingRuleResponse = {
  success?: boolean;
  scheduling_rule?: SchedulingRuleDto;
};

export type CreateDiaryRequest = {
  diary: {
    title: string;
    description: string;
  };
  scheduling_rules: SchedulingRulePayload;
};

export type UpdateDiaryRequest = {
  diary: {
    title: string;
    description: string;
  };
};

export type UpdateSchedulingRuleRequest = {
  scheduling_rules: SchedulingRulePayload;
};

export type SchedulingRulePayload = {
  start_time: string;
  end_time: string;
  session_duration_minutes: number;
  week_days: number[];
  start_date?: string;
  end_date?: string;
};

export type SettingsTab = "diary" | "scheduling";

export type SchedulingRuleFormValues = {
  startTime: string;
  endTime: string;
  sessionDuration: string;
  weekDays: number[];
  startDate: string;
  endDate: string;
};
