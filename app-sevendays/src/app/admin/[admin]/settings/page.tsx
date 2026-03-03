"use client";
import { CircleNotch } from "@phosphor-icons/react";

import { DatePickerSimple } from "@/components/DatePickerSimple";
import { OwnerSettingsSkeleton } from "@/components/OwnerSettingsSkeleton";
import { SettingsFormSection } from "@/components/SettingsFormSection";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useOwnerSettings } from "@/hooks/useOwnerSettings";
import {
  WEEK_DAY_OPTIONS,
  formatDateInputValue,
  getOwnerSettingsTabButtonClass,
  parseDateInputValue,
} from "@/lib/helpers/owner-settings";

export default function AdminSettingsPage() {
  const {
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
  } = useOwnerSettings();

  if (isLoading) {
    return <OwnerSettingsSkeleton />;
  }

  return (
    <div className="w-full max-w-7xl flex flex-col items-start justify-start gap-8 sm:mx-auto mx-0 px-4 py-10 pb-16">
      <div className="w-full flex flex-col">
        <h1 className="text-3xl text-primary/90 font-bold">Configurações da Agenda</h1>
        <p className="text-sm text-muted-foreground">{pageTitle}</p>
      </div>

      <div className="w-full relative pt-4">
        <Separator className="w-full h-[1px] bg-primary/40" />
        <div className="absolute left-0 top-4 -translate-y-1/2 bg-background pr-4 flex items-end gap-6">
          <button
            type="button"
            className={getOwnerSettingsTabButtonClass(activeTab, "diary")}
            onClick={() => setActiveTab("diary")}
            disabled={isSavingDiary || isSavingScheduling}
          >
            Dados da agenda
          </button>
          <button
            type="button"
            className={getOwnerSettingsTabButtonClass(activeTab, "scheduling")}
            onClick={() => setActiveTab("scheduling")}
            disabled={isSavingDiary || isSavingScheduling}
          >
            Funcionamento
          </button>
        </div>
      </div>

      {activeTab === "diary" ? (
        <form className="w-full flex flex-col gap-6" onSubmit={handleSubmitDiary}>
          <SettingsFormSection
            title="Editar dados da agenda"
            description="Esses dados identificam sua agenda pública para os usuários."
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="diary-title">Título da agenda</Label>
              <Input
                id="diary-title"
                type="text"
                value={diaryTitle}
                onChange={(event) => setDiaryTitle(event.target.value)}
                placeholder="Ex.: Consultório de Enfermagem"
                disabled={isSavingDiary}
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
                disabled={isSavingDiary}
              />
            </div>
          </SettingsFormSection>

          <div className="w-full flex items-center justify-end">
            <Button type="submit" disabled={isSavingDiary}>
              {isSavingDiary ? (
                <>
                  <CircleNotch size={14} className="animate-spin" />
                  Salvando...
                </>
              ) : hasDiary ? (
                "Salvar dados da agenda"
              ) : (
                "Criar dados da agenda"
              )}
            </Button>
          </div>
        </form>
      ) : (
        <form className="w-full flex flex-col gap-6" onSubmit={handleSubmitScheduling}>
          <SettingsFormSection
            title="Editar funcionamento"
            description="Defina janela de atendimento, duração das sessões e dias permitidos."
            contentClassName="flex flex-col gap-5"
          >
            {!hasDiary ? (
              <p className="text-sm text-muted-foreground">
                Crie os dados da agenda na aba anterior para liberar esta configuração.
              </p>
            ) : null}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="start-time">Horário inicial</Label>
                  <Input
                    id="start-time"
                    type="time"
                    value={startTime}
                    onChange={(event) => setStartTime(event.target.value)}
                    disabled={isSavingScheduling || !hasDiary}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="end-time">Horário final</Label>
                  <Input
                    id="end-time"
                    type="time"
                    value={endTime}
                    onChange={(event) => setEndTime(event.target.value)}
                    disabled={isSavingScheduling || !hasDiary}
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
                  disabled={isSavingScheduling || !hasDiary}
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
                        disabled={isSavingScheduling || !hasDiary}
                      />
                      <span>{day.label}</span>
                    </label>
                  ))}
                </div>
              </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="start-date">Data inicial (opcional)</Label>
                <DatePickerSimple
                  id="start-date"
                  label="Data inicial (opcional)"
                  labelClassName="sr-only"
                  placeholder="Selecione a data inicial"
                  className="w-full"
                  value={parseDateInputValue(startDate)}
                  onChange={(nextDate) => setStartDate(formatDateInputValue(nextDate))}
                  disabled={isSavingScheduling || !hasDiary}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="end-date">Data final (opcional)</Label>
                <DatePickerSimple
                  id="end-date"
                  label="Data final (opcional)"
                  labelClassName="sr-only"
                  placeholder="Selecione a data final"
                  className="w-full"
                  value={parseDateInputValue(endDate)}
                  onChange={(nextDate) => setEndDate(formatDateInputValue(nextDate))}
                  disabled={isSavingScheduling || !hasDiary}
                />
              </div>
            </div>
          </SettingsFormSection>

          <div className="w-full flex items-center justify-end">
            <Button type="submit" disabled={isSavingScheduling || !hasDiary}>
              {isSavingScheduling ? (
                <>
                  <CircleNotch size={14} className="animate-spin" />
                  Salvando...
                </>
              ) : hasSchedulingRule ? (
                "Salvar funcionamento"
              ) : (
                "Criar funcionamento"
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
