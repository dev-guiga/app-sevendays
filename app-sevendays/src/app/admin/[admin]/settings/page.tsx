"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { sevendaysapi } from "@/lib/sevendaysapi";
import { CircleNotch } from "@phosphor-icons/react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

type OwnerStatus = "owner" | "user" | "standard";

type CurrentOwnerResponse = {
  user?: {
    id?: number;
    full_name?: string;
    username?: string;
    status?: OwnerStatus;
  };
};

type OwnerDiaryResponse = {
  success?: boolean;
  diary_data?: {
    title?: string;
    description?: string;
  };
};

type OwnerDiaryCreateResponse = {
  success?: boolean;
  diary?: {
    id?: number;
    title?: string;
    description?: string;
  };
  scheduling_rule?: SchedulingRuleDto;
};

type OwnerDiaryUpdateResponse = {
  success?: boolean;
  diary?: {
    id?: number;
    title?: string;
    description?: string;
  };
};

type SchedulingRuleDto = {
  id?: number;
  start_time?: string | null;
  end_time?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  session_duration_minutes?: number | null;
  week_days?: Array<number | string> | null;
};

type OwnerSchedulingRuleResponse = {
  success?: boolean;
  scheduling_rule?: SchedulingRuleDto;
};

type ApiErrorResponse = {
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
};

type CreateDiaryRequest = {
  diary: {
    title: string;
    description: string;
  };
  scheduling_rules: SchedulingRulePayload;
};

type UpdateDiaryRequest = {
  diary: {
    title: string;
    description: string;
  };
};

type UpdateSchedulingRuleRequest = {
  scheduling_rules: SchedulingRulePayload;
};

type SchedulingRulePayload = {
  start_time: string;
  end_time: string;
  session_duration_minutes: number;
  week_days: number[];
  start_date?: string;
  end_date?: string;
};

const DEFAULT_START_TIME = "09:00";
const DEFAULT_END_TIME = "19:00";
const DEFAULT_SESSION_DURATION = "60";
const DEFAULT_WEEK_DAYS = [0, 1, 2, 3, 4, 5, 6];

const WEEK_DAY_OPTIONS = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Segunda" },
  { value: 2, label: "Terça" },
  { value: 3, label: "Quarta" },
  { value: 4, label: "Quinta" },
  { value: 5, label: "Sexta" },
  { value: 6, label: "Sábado" },
];

function normalizeTimeValue(value?: string | null) {
  if (!value) {
    return "";
  }

  const match = value.match(/(\d{2}):(\d{2})/);
  if (!match) {
    return "";
  }

  return `${match[1]}:${match[2]}`;
}

function normalizeDateValue(value?: string | null) {
  if (!value) {
    return "";
  }

  const match = value.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (!match) {
    return "";
  }

  return `${match[1]}-${match[2]}-${match[3]}`;
}

function normalizeWeekDays(value?: Array<number | string> | null) {
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

function extractApiErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "string" && error.trim().length > 0) {
    return error;
  }

  if (error && typeof error === "object") {
    const payload = error as ApiErrorResponse;

    if (
      payload.error?.message &&
      typeof payload.error.message === "string" &&
      payload.error.message.trim().length > 0
    ) {
      return payload.error.message;
    }

    if (payload.error?.details && typeof payload.error.details === "object") {
      const detailsValues = Object.values(
        payload.error.details as Record<string, unknown>,
      );

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
              if (
                typeof firstNested === "string" &&
                firstNested.trim().length > 0
              ) {
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

function parseSchedulingRuleToForm(rule: SchedulingRuleDto) {
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

function buildSchedulingRulePayload({
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

function validateForm({
  diaryTitle,
  diaryDescription,
  startTime,
  endTime,
  sessionDuration,
  selectedWeekDays,
  startDate,
  endDate,
}: {
  diaryTitle: string;
  diaryDescription: string;
  startTime: string;
  endTime: string;
  sessionDuration: string;
  selectedWeekDays: number[];
  startDate: string;
  endDate: string;
}) {
  if (!diaryTitle.trim()) {
    return "Informe o título da agenda.";
  }

  if (!diaryDescription.trim() || diaryDescription.trim().length < 10) {
    return "A descrição da agenda precisa ter pelo menos 10 caracteres.";
  }

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

export default function AdminSettingsPage() {
  const params = useParams<{ admin?: string }>();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasDiary, setHasDiary] = useState(false);
  const [hasSchedulingRule, setHasSchedulingRule] = useState(false);

  const [diaryTitle, setDiaryTitle] = useState("");
  const [diaryDescription, setDiaryDescription] = useState("");
  const [startTime, setStartTime] = useState(DEFAULT_START_TIME);
  const [endTime, setEndTime] = useState(DEFAULT_END_TIME);
  const [sessionDuration, setSessionDuration] = useState(DEFAULT_SESSION_DURATION);
  const [selectedWeekDays, setSelectedWeekDays] = useState<number[]>(DEFAULT_WEEK_DAYS);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const routeOwnerId = Number(params?.admin);

  const pageTitle = useMemo(() => {
    if (!hasDiary) {
      return "Criar funcionamento da agenda";
    }

    if (!hasSchedulingRule) {
      return "Adicionar funcionamento da agenda";
    }

    return "Editar funcionamento da agenda";
  }, [hasDiary, hasSchedulingRule]);

  useEffect(() => {
    let ignore = false;

    async function loadPageData() {
      setIsLoading(true);

      const currentUserResult = await sevendaysapi.get<CurrentOwnerResponse>("/user", {
        withCredentials: true,
      });

      if (ignore) {
        return;
      }

      if (
        currentUserResult.error ||
        currentUserResult.statusCode !== 200 ||
        !currentUserResult.data?.user
      ) {
        toast.error("Não foi possível carregar o usuário autenticado.");
        setIsLoading(false);
        return;
      }

      const currentUser = currentUserResult.data.user;
      if (currentUser.status !== "owner" || !currentUser.id) {
        toast.error("Usuário autenticado não é um owner.");
        setIsLoading(false);
        return;
      }

      if (Number.isFinite(routeOwnerId) && routeOwnerId !== currentUser.id) {
        router.replace(`/admin/${currentUser.id}/settings`);
      }

      const diaryResult = await sevendaysapi.get<OwnerDiaryResponse>("/owner/diary", {
        withCredentials: true,
      });

      if (ignore) {
        return;
      }

      if (diaryResult.statusCode === 404) {
        setHasDiary(false);
        setHasSchedulingRule(false);
        setIsLoading(false);
        return;
      }

      if (
        diaryResult.error ||
        diaryResult.statusCode !== 200 ||
        !diaryResult.data?.success
      ) {
        toast.error(
          extractApiErrorMessage(diaryResult.error, "Não foi possível carregar os dados da agenda."),
        );
        setIsLoading(false);
        return;
      }

      setHasDiary(true);
      setDiaryTitle(diaryResult.data.diary_data?.title ?? "");
      setDiaryDescription(diaryResult.data.diary_data?.description ?? "");

      const schedulingRuleResult = await sevendaysapi.get<OwnerSchedulingRuleResponse>(
        "/owner/diary/scheduling_rule",
        { withCredentials: true },
      );

      if (ignore) {
        return;
      }

      if (schedulingRuleResult.statusCode === 404) {
        setHasSchedulingRule(false);
        setIsLoading(false);
        return;
      }

      if (
        schedulingRuleResult.error ||
        schedulingRuleResult.statusCode !== 200 ||
        !schedulingRuleResult.data?.success ||
        !schedulingRuleResult.data.scheduling_rule
      ) {
        toast.error(
          extractApiErrorMessage(
            schedulingRuleResult.error,
            "Não foi possível carregar o funcionamento da agenda.",
          ),
        );
        setIsLoading(false);
        return;
      }

      const parsedRule = parseSchedulingRuleToForm(
        schedulingRuleResult.data.scheduling_rule,
      );

      setHasSchedulingRule(true);
      setStartTime(parsedRule.startTime);
      setEndTime(parsedRule.endTime);
      setSessionDuration(parsedRule.sessionDuration);
      setSelectedWeekDays(parsedRule.weekDays);
      setStartDate(parsedRule.startDate);
      setEndDate(parsedRule.endDate);
      setIsLoading(false);
    }

    void loadPageData();

    return () => {
      ignore = true;
    };
  }, [routeOwnerId, router]);

  const handleToggleWeekDay = (weekDay: number, checked: boolean) => {
    setSelectedWeekDays((previous) => {
      if (checked) {
        return Array.from(new Set([...previous, weekDay])).sort((a, b) => a - b);
      }

      return previous.filter((day) => day !== weekDay);
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationMessage = validateForm({
      diaryTitle,
      diaryDescription,
      startTime,
      endTime,
      sessionDuration,
      selectedWeekDays,
      startDate,
      endDate,
    });

    if (validationMessage) {
      toast.error(validationMessage);
      return;
    }

    const schedulingRulePayload = buildSchedulingRulePayload({
      startTime,
      endTime,
      sessionDuration,
      selectedWeekDays,
      startDate,
      endDate,
    });

    setIsSaving(true);

    if (!hasDiary) {
      const createDiaryPayload: CreateDiaryRequest = {
        diary: {
          title: diaryTitle.trim(),
          description: diaryDescription.trim(),
        },
        scheduling_rules: schedulingRulePayload,
      };

      const createDiaryResult = await sevendaysapi.post<
        OwnerDiaryCreateResponse,
        CreateDiaryRequest
      >("/owner/diary", createDiaryPayload, { withCredentials: true });

      if (
        createDiaryResult.error ||
        createDiaryResult.statusCode !== 201 ||
        !createDiaryResult.data?.success
      ) {
        toast.error(
          extractApiErrorMessage(
            createDiaryResult.error,
            "Não foi possível criar a agenda com o funcionamento informado.",
          ),
        );
        setIsSaving(false);
        return;
      }

      setHasDiary(true);

      if (createDiaryResult.data.scheduling_rule) {
        const parsedRule = parseSchedulingRuleToForm(
          createDiaryResult.data.scheduling_rule,
        );
        setStartTime(parsedRule.startTime);
        setEndTime(parsedRule.endTime);
        setSessionDuration(parsedRule.sessionDuration);
        setSelectedWeekDays(parsedRule.weekDays);
        setStartDate(parsedRule.startDate);
        setEndDate(parsedRule.endDate);
        setHasSchedulingRule(true);
      }

      toast.success("Agenda e funcionamento criados com sucesso.");
      setIsSaving(false);
      return;
    }

    const updateDiaryPayload: UpdateDiaryRequest = {
      diary: {
        title: diaryTitle.trim(),
        description: diaryDescription.trim(),
      },
    };

    const updateDiaryResult = await sevendaysapi.patch<
      OwnerDiaryUpdateResponse,
      UpdateDiaryRequest
    >("/owner/diary", updateDiaryPayload, { withCredentials: true });

    if (
      updateDiaryResult.error ||
      updateDiaryResult.statusCode !== 200 ||
      !updateDiaryResult.data?.success
    ) {
      toast.error(
        extractApiErrorMessage(updateDiaryResult.error, "Não foi possível atualizar a agenda."),
      );
      setIsSaving(false);
      return;
    }

    const schedulingRuleRequestPayload: UpdateSchedulingRuleRequest = {
      scheduling_rules: schedulingRulePayload,
    };

    const schedulingRuleResult = hasSchedulingRule
      ? await sevendaysapi.patch<
          OwnerSchedulingRuleResponse,
          UpdateSchedulingRuleRequest
        >("/owner/diary/scheduling_rule", schedulingRuleRequestPayload, {
          withCredentials: true,
        })
      : await sevendaysapi.post<
          OwnerSchedulingRuleResponse,
          UpdateSchedulingRuleRequest
        >("/owner/diary/scheduling_rule", schedulingRuleRequestPayload, {
          withCredentials: true,
        });

    const expectedStatus = hasSchedulingRule ? 200 : 201;
    if (
      schedulingRuleResult.error ||
      schedulingRuleResult.statusCode !== expectedStatus ||
      !schedulingRuleResult.data?.success ||
      !schedulingRuleResult.data.scheduling_rule
    ) {
      toast.error(
        extractApiErrorMessage(
          schedulingRuleResult.error,
          "Não foi possível salvar o funcionamento da agenda.",
        ),
      );
      setIsSaving(false);
      return;
    }

    const parsedRule = parseSchedulingRuleToForm(
      schedulingRuleResult.data.scheduling_rule,
    );
    setStartTime(parsedRule.startTime);
    setEndTime(parsedRule.endTime);
    setSessionDuration(parsedRule.sessionDuration);
    setSelectedWeekDays(parsedRule.weekDays);
    setStartDate(parsedRule.startDate);
    setEndDate(parsedRule.endDate);
    setHasSchedulingRule(true);
    setIsSaving(false);
    toast.success("Funcionamento da agenda salvo com sucesso.");
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-7xl flex flex-col items-start justify-start gap-8 sm:mx-auto mx-0 px-4 py-10">
        <div className="w-full flex items-center justify-between gap-4">
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-9 w-40" />
        </div>

        <Card className="w-full">
          <CardHeader className="space-y-2">
            <Skeleton className="h-7 w-60" />
            <Skeleton className="h-4 w-80" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader className="space-y-2">
            <Skeleton className="h-7 w-64" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-40" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-9 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl flex flex-col items-start justify-start gap-8 sm:mx-auto mx-0 px-4 py-10 pb-16">
      <div className="w-full flex flex-col">
        <h1 className="text-3xl text-primary/90 font-bold">Configurações da Agenda</h1>
        <p className="text-sm text-muted-foreground">{pageTitle}</p>
      </div>

      <Separator className="w-full h-[1px] bg-primary/40" />

      <form className="w-full flex flex-col gap-6" onSubmit={handleSubmit}>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Dados da agenda</CardTitle>
            <CardDescription>
              Esses dados identificam sua agenda pública para os usuários.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="diary-title">Título da agenda</Label>
              <Input
                id="diary-title"
                type="text"
                value={diaryTitle}
                onChange={(event) => setDiaryTitle(event.target.value)}
                placeholder="Ex.: Consultório de Enfermagem"
                disabled={isSaving}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="diary-description">Descrição da agenda</Label>
              <Textarea
                id="diary-description"
                value={diaryDescription}
                onChange={(event) => setDiaryDescription(event.target.value)}
                placeholder="Descreva os tipos de atendimento realizados."
                className="min-h-28"
                disabled={isSaving}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>Funcionamento</CardTitle>
            <CardDescription>
              Defina janela de atendimento, duração das sessões e dias permitidos.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="start-time">Horário inicial</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={startTime}
                  onChange={(event) => setStartTime(event.target.value)}
                  disabled={isSaving}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="end-time">Horário final</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={endTime}
                  onChange={(event) => setEndTime(event.target.value)}
                  disabled={isSaving}
                />
              </div>
            </div>

            <div className="w-full sm:max-w-xs flex flex-col gap-2">
              <Label htmlFor="session-duration">Duração da sessão (minutos)</Label>
              <Input
                id="session-duration"
                type="number"
                min={15}
                step={15}
                value={sessionDuration}
                onChange={(event) => setSessionDuration(event.target.value)}
                disabled={isSaving}
              />
              <p className="text-xs text-muted-foreground">
                Use múltiplos de 15 minutos.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Label>Dias de funcionamento</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {WEEK_DAY_OPTIONS.map((day) => (
                  <label
                    key={day.value}
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <Checkbox
                      checked={selectedWeekDays.includes(day.value)}
                      onCheckedChange={(checked) =>
                        handleToggleWeekDay(day.value, checked === true)
                      }
                      disabled={isSaving}
                    />
                    <span>{day.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="start-date">Data inicial (opcional)</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  disabled={isSaving}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="end-date">Data final (opcional)</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  disabled={isSaving}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="w-full flex items-center justify-end">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <CircleNotch size={14} className="animate-spin" />
                Salvando...
              </>
            ) : hasDiary && hasSchedulingRule ? (
              "Salvar alterações"
            ) : (
              "Criar funcionamento"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
