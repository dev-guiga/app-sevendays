class CancelOwnerSchedulingService
  def initialize(diary:, scheduling_id:)
    @diary = diary
    @scheduling_id = scheduling_id
  end

  def call
    scheduling = diary.schedulings.find_by(id: scheduling_id)
    return error_result("Scheduling not found", :not_found) unless scheduling

    return success_result(scheduling) if scheduling.cancelled?

    if too_soon_to_cancel?(scheduling)
      return error_result("Scheduling cannot be cancelled within #{lead_minutes_for(scheduling)} minutes", :unprocessable_entity)
    end

    diary.with_lock do
      now = Time.current
      scheduling.update_columns(status: "cancelled", updated_at: now)
      scheduling.status = "cancelled"
      scheduling.updated_at = now

      success_result(scheduling)
    end
  end

  private
  attr_reader :diary, :scheduling_id

  def too_soon_to_cancel?(scheduling)
    return false if scheduling.date.blank? || scheduling.time.blank?

    scheduled_at = Time.zone.local(
      scheduling.date.year,
      scheduling.date.month,
      scheduling.date.day,
      scheduling.time.hour,
      scheduling.time.min,
      scheduling.time.sec
    )

    scheduled_at < (Time.current + lead_minutes_for(scheduling).minutes).beginning_of_minute
  end

  def lead_minutes_for(scheduling)
    duration = scheduling.session_duration_minutes || scheduling.scheduling_rule&.effective_duration_minutes
    return 60 if duration.blank?

    duration.between?(15, 45) ? 30 : 60
  end

  def success_result(scheduling)
    ServiceResult.new(
      success: true,
      payload: { scheduling: scheduling, user: scheduling.user }
    )
  end

  def error_result(message, status)
    ServiceResult.new(success: false, errors: message, status: status)
  end
end
