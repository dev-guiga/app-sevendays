"use client";

import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { useUser } from "@/contexts/user-context";

import {
  DEFAULT_END_TIME,
  DEFAULT_SESSION_DURATION,
  DEFAULT_START_TIME,
  DEFAULT_WEEK_DAYS,
  buildSchedulingRulePayload,
  extractOwnerSettingsApiErrorMessage,
  getOwnerSettingsPageTitle,
  parseSchedulingRuleToForm,
  validateDiaryForm,
  validateSchedulingForm,
} from "@/lib/helpers/owner-settings";


import type {
  CreateDiaryRequest,
  OwnerDiaryCreateResponse,
  OwnerDiaryResponse,
  OwnerDiaryUpdateResponse,
  OwnerSchedulingRuleResponse,
  SettingsTab,
  SchedulingRuleDto,
  UpdateDiaryRequest,
  UpdateSchedulingRuleRequest,
} from "@/types/owner-settings";

import { sevendaysapi } from "@/lib/sevendaysapi";

function applySchedulingRuleToState(
  rule: SchedulingRuleDto,
  setters: {
    setStartTime: (value: string) => void;
    setEndTime: (value: string) => void;
    setSessionDuration: (value: string) => void;
    setSelectedWeekDays: (value: number[]) => void;
    setStartDate: (value: string) => void;
    setEndDate: (value: string) => void;
    setHasSchedulingRule?: (value: boolean) => void;
  }
) {
  const parsedRule = parseSchedulingRuleToForm(rule);
  setters.setStartTime(parsedRule.startTime);
  setters.setEndTime(parsedRule.endTime);
  setters.setSessionDuration(parsedRule.sessionDuration);
  setters.setSelectedWeekDays(parsedRule.weekDays);
  setters.setStartDate(parsedRule.startDate);
  setters.setEndDate(parsedRule.endDate);
  setters.setHasSchedulingRule?.(true);
}

export function useOwnerSettings() {
  const params = useParams<{ admin?: string }>();
  const router = useRouter();
  const { currentUser, isLoadingUser } = useUser();

  const [isSavingDiary, setIsSavingDiary] = useState(false);
  const [isSavingScheduling, setIsSavingScheduling] = useState(false);
  const [hasDiary, setHasDiary] = useState(false);
  const [hasSchedulingRule, setHasSchedulingRule] = useState(false);
  const [activeTab, setActiveTab] = useState<SettingsTab>("diary");

  const [diaryTitle, setDiaryTitle] = useState("");
  const [diaryDescription, setDiaryDescription] = useState("");
  const [startTime, setStartTime] = useState(DEFAULT_START_TIME);
  const [endTime, setEndTime] = useState(DEFAULT_END_TIME);
  const [sessionDuration, setSessionDuration] = useState(DEFAULT_SESSION_DURATION);
  const [selectedWeekDays, setSelectedWeekDays] = useState<number[]>(DEFAULT_WEEK_DAYS);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const routeOwnerId = Number(params?.admin);
  const authenticatedOwnerId = currentUser?.status === "owner" ? currentUser.id : undefined;
  const isOwnerReady = Boolean(authenticatedOwnerId);

  const pageTitle = useMemo(
    () => getOwnerSettingsPageTitle(hasDiary, hasSchedulingRule),
    [hasDiary, hasSchedulingRule]
  );

  useEffect(() => {
    if (isLoadingUser) {
      return;
    }

    if (!currentUser) {
      router.replace("/login");
      return;
    }

    if (currentUser.status !== "owner" || !currentUser.id) {
      toast.error("Usuário autenticado não é um owner.");
      if (currentUser.id) {
        router.replace(`/${currentUser.id}/portal`);
      }
      return;
    }

    if (Number.isFinite(routeOwnerId) && routeOwnerId !== currentUser.id) {
      router.replace(`/admin/${currentUser.id}/settings`);
    }
  }, [currentUser, isLoadingUser, routeOwnerId, router]);

  const diaryQuery = useQuery({
    queryKey: ["owner-settings-diary", authenticatedOwnerId],
    enabled: isOwnerReady,
    queryFn: async () => {
      const diaryResult = await sevendaysapi.get<OwnerDiaryResponse>("/owner/diary", {
        withCredentials: true,
      });

      if (diaryResult.statusCode === 404) {
        return {
          hasDiary: false,
          diaryData: null as OwnerDiaryResponse["diary_data"] | null,
        };
      }

      if (diaryResult.error || diaryResult.statusCode !== 200 || !diaryResult.data?.success) {
        throw new Error(
          extractOwnerSettingsApiErrorMessage(
            diaryResult.error,
            "Não foi possível carregar os dados da agenda."
          )
        );
      }

      return {
        hasDiary: true,
        diaryData: diaryResult.data.diary_data ?? null,
      };
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const schedulingRuleQuery = useQuery({
    queryKey: ["owner-settings-scheduling-rule", authenticatedOwnerId],
    enabled: isOwnerReady && diaryQuery.data?.hasDiary === true,
    queryFn: async () => {
      const schedulingRuleResult = await sevendaysapi.get<OwnerSchedulingRuleResponse>(
        "/owner/diary/scheduling_rule",
        { withCredentials: true }
      );

      if (schedulingRuleResult.statusCode === 404) {
        return {
          hasSchedulingRule: false,
          schedulingRule: null as SchedulingRuleDto | null,
        };
      }

      if (
        schedulingRuleResult.error ||
        schedulingRuleResult.statusCode !== 200 ||
        !schedulingRuleResult.data?.success ||
        !schedulingRuleResult.data.scheduling_rule
      ) {
        throw new Error(
          extractOwnerSettingsApiErrorMessage(
            schedulingRuleResult.error,
            "Não foi possível carregar o funcionamento da agenda."
          )
        );
      }

      return {
        hasSchedulingRule: true,
        schedulingRule: schedulingRuleResult.data.scheduling_rule,
      };
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!diaryQuery.isError) {
      return;
    }

    const errorMessage =
      diaryQuery.error instanceof Error
        ? diaryQuery.error.message
        : "Não foi possível carregar os dados da agenda.";
    toast.error(errorMessage);
  }, [diaryQuery.error, diaryQuery.errorUpdatedAt, diaryQuery.isError]);

  useEffect(() => {
    if (!schedulingRuleQuery.isError) {
      return;
    }

    const errorMessage =
      schedulingRuleQuery.error instanceof Error
        ? schedulingRuleQuery.error.message
        : "Não foi possível carregar o funcionamento da agenda.";
    toast.error(errorMessage);
  }, [
    schedulingRuleQuery.error,
    schedulingRuleQuery.errorUpdatedAt,
    schedulingRuleQuery.isError,
  ]);

  useEffect(() => {
    if (!diaryQuery.data) {
      return;
    }

    if (!diaryQuery.data.hasDiary) {
      setHasDiary(false);
      setHasSchedulingRule(false);
      return;
    }

    setHasDiary(true);
    setDiaryTitle(diaryQuery.data.diaryData?.title ?? "");
    setDiaryDescription(diaryQuery.data.diaryData?.description ?? "");
  }, [diaryQuery.data]);

  useEffect(() => {
    if (!diaryQuery.data?.hasDiary || !schedulingRuleQuery.data) {
      return;
    }

    if (!schedulingRuleQuery.data.hasSchedulingRule || !schedulingRuleQuery.data.schedulingRule) {
      setHasSchedulingRule(false);
      return;
    }

    applySchedulingRuleToState(schedulingRuleQuery.data.schedulingRule, {
      setStartTime,
      setEndTime,
      setSessionDuration,
      setSelectedWeekDays,
      setStartDate,
      setEndDate,
      setHasSchedulingRule,
    });
  }, [diaryQuery.data?.hasDiary, schedulingRuleQuery.data]);

  const isLoading =
    isLoadingUser ||
    (isOwnerReady &&
      (diaryQuery.isPending || (diaryQuery.data?.hasDiary === true && schedulingRuleQuery.isPending)));

  const handleToggleWeekDay = (weekDay: number, checked: boolean) => {
    setSelectedWeekDays((previous) => {
      if (checked) {
        return Array.from(new Set([...previous, weekDay])).sort((a, b) => a - b);
      }

      return previous.filter((day) => day !== weekDay);
    });
  };

  const handleSubmitDiary = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationMessage = validateDiaryForm({
      diaryTitle,
      diaryDescription,
    });

    if (validationMessage) {
      toast.error(validationMessage);
      return;
    }

    setIsSavingDiary(true);

    try {
      if (!hasDiary) {
        const schedulingRulePayload = buildSchedulingRulePayload({
          startTime,
          endTime,
          sessionDuration,
          selectedWeekDays,
          startDate,
          endDate,
        });

        const createDiaryPayload: CreateDiaryRequest = {
          diary: {
            title: diaryTitle.trim(),
            description: diaryDescription.trim(),
          },
          scheduling_rules: schedulingRulePayload,
        };

        const createDiaryResult = await sevendaysapi.post<OwnerDiaryCreateResponse, CreateDiaryRequest>(
          "/owner/diary",
          createDiaryPayload,
          { withCredentials: true }
        );

        if (
          createDiaryResult.error ||
          createDiaryResult.statusCode !== 201 ||
          !createDiaryResult.data?.success
        ) {
          toast.error(
            extractOwnerSettingsApiErrorMessage(
              createDiaryResult.error,
              "Não foi possível criar a agenda com o funcionamento informado."
            )
          );
          return;
        }

        setHasDiary(true);

        if (createDiaryResult.data.scheduling_rule) {
          applySchedulingRuleToState(createDiaryResult.data.scheduling_rule, {
            setStartTime,
            setEndTime,
            setSessionDuration,
            setSelectedWeekDays,
            setStartDate,
            setEndDate,
            setHasSchedulingRule,
          });
        }

        toast.success("Dados da agenda criados com sucesso.");
        return;
      }

      const updateDiaryPayload: UpdateDiaryRequest = {
        diary: {
          title: diaryTitle.trim(),
          description: diaryDescription.trim(),
        },
      };

      const updateDiaryResult = await sevendaysapi.patch<OwnerDiaryUpdateResponse, UpdateDiaryRequest>(
        "/owner/diary",
        updateDiaryPayload,
        { withCredentials: true }
      );

      if (
        updateDiaryResult.error ||
        updateDiaryResult.statusCode !== 200 ||
        !updateDiaryResult.data?.success
      ) {
        toast.error(
          extractOwnerSettingsApiErrorMessage(
            updateDiaryResult.error,
            "Não foi possível atualizar a agenda."
          )
        );
        return;
      }

      toast.success("Dados da agenda salvos com sucesso.");
    } finally {
      setIsSavingDiary(false);
    }
  };

  const handleSubmitScheduling = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!hasDiary) {
      toast.error("Crie os dados da agenda antes de definir o funcionamento.");
      setActiveTab("diary");
      return;
    }

    const validationMessage = validateSchedulingForm({
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

    setIsSavingScheduling(true);

    try {
      const schedulingRuleRequestPayload: UpdateSchedulingRuleRequest = {
        scheduling_rules: schedulingRulePayload,
      };

      const schedulingRuleResult = hasSchedulingRule
        ? await sevendaysapi.patch<OwnerSchedulingRuleResponse, UpdateSchedulingRuleRequest>(
            "/owner/diary/scheduling_rule",
            schedulingRuleRequestPayload,
            { withCredentials: true }
          )
        : await sevendaysapi.post<OwnerSchedulingRuleResponse, UpdateSchedulingRuleRequest>(
            "/owner/diary/scheduling_rule",
            schedulingRuleRequestPayload,
            { withCredentials: true }
          );

      const expectedStatus = hasSchedulingRule ? 200 : 201;
      if (
        schedulingRuleResult.error ||
        schedulingRuleResult.statusCode !== expectedStatus ||
        !schedulingRuleResult.data?.success ||
        !schedulingRuleResult.data.scheduling_rule
      ) {
        toast.error(
          extractOwnerSettingsApiErrorMessage(
            schedulingRuleResult.error,
            "Não foi possível salvar o funcionamento da agenda."
          )
        );
        return;
      }

      applySchedulingRuleToState(schedulingRuleResult.data.scheduling_rule, {
        setStartTime,
        setEndTime,
        setSessionDuration,
        setSelectedWeekDays,
        setStartDate,
        setEndDate,
        setHasSchedulingRule,
      });

      toast.success("Funcionamento da agenda salvo com sucesso.");
    } finally {
      setIsSavingScheduling(false);
    }
  };

  return {
    isLoading,
    pageTitle,
    activeTab,
    setActiveTab,
    isSavingDiary,
    isSavingScheduling,
    hasDiary,
    hasSchedulingRule,
    diaryTitle,
    setDiaryTitle,
    diaryDescription,
    setDiaryDescription,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    sessionDuration,
    setSessionDuration,
    selectedWeekDays,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    handleToggleWeekDay,
    handleSubmitDiary,
    handleSubmitScheduling,
  };
}

