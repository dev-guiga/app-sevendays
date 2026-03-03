export type AvailableSlot = {
  start_time?: string;
  end_time?: string;
};

export type AvailableSlotsResponse = {
  success?: boolean;
  date?: string;
  available_slots?: AvailableSlot[];
};

export type CreateSchedulingResponse = {
  success?: boolean;
  id?: number;
  date?: string;
  time?: string;
  status?: string;
};

export type DefaultCreateSchedulingPayload = {
  scheduling: {
    date: string;
    time: string;
    description: string;
  };
};

export type BuildCreatePayloadParams = {
  date: string;
  time: string;
};

export type SchedulingCreateState = {
  canSubmit: boolean;
  isSubmitting: boolean;
};

export type SchedulingCalendarProps = {
  resourceId?: number;
  endpointBasePath?: string;
  daysEndpoint?: string;
  createEndpoint?: string;
  buildCreatePayload?: (params: BuildCreatePayloadParams) => unknown;
  confirmButtonLabel?: string;
  isConfirmDisabled?: boolean;
  successMessage?: string;
  createErrorMessage?: string;
  onCreateSuccess?: () => void;
  isOwnerScheduling?: boolean;
  submitRequestToken?: number;
  onCreateStateChange?: (state: SchedulingCreateState) => void;
};
