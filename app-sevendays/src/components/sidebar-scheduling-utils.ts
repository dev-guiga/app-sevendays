export type SidebarSchedulingResponse = {
  success: boolean;
  schedulings?: SidebarScheduling[];
};

export type SidebarScheduling = {
  id: number;
  diary_id: number;
  diary_title?: string;
  professional_name?: string;
  date: string;
  time: string;
  status: string;
  description: string;
};

export type SidebarSchedulingCard = {
  id: number;
  date: string;
  time: string;
  service: string;
  type: string;
  professional: string;
};

function formatSchedulingDate(dateValue: string) {
  const isoDateMatch = dateValue.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoDateMatch) {
    const [, year, month, day] = isoDateMatch;
    return `${day}/${month}/${year}`;
  }

  const dateInTimestampMatch = dateValue.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (dateInTimestampMatch) {
    const [, year, month, day] = dateInTimestampMatch;
    return `${day}/${month}/${year}`;
  }

  return dateValue;
}

function formatSchedulingTime(timeValue: string) {
  const timeMatch = timeValue.match(/(\d{2}):(\d{2})/);
  if (timeMatch) {
    return `${timeMatch[1]}:${timeMatch[2]}`;
  }

  return timeValue;
}

export function mapSidebarSchedulingsToCards(
  schedulings: SidebarScheduling[] | undefined,
): SidebarSchedulingCard[] {
  return (schedulings ?? []).map((scheduling) => ({
    id: scheduling.id,
    date: formatSchedulingDate(scheduling.date),
    time: formatSchedulingTime(scheduling.time),
    service: scheduling.diary_title || "Atendimento",
    type: scheduling.description || "Sem descricao",
    professional: scheduling.professional_name || "Profissional",
  }));
}
