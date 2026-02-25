class UpdateOwnerSchedulingService
  def initialize(diary:, scheduling_id:, params:)
    @diary = diary
    @scheduling_id = scheduling_id
    @params = params
  end

  def call
    scheduling = diary.schedulings.find_by(id: scheduling_id)
    return error_result("Scheduling not found", :not_found) unless scheduling

    user = User.find_by(email: params[:user_email])
    return error_result("User not found", :not_found) unless user
    return error_result("User must be non-owner", :unprocessable_entity) if user.owner?

    unless scheduling.user_id == user.id
      return error_result("Scheduling does not belong to user", :unprocessable_entity)
    end

    if too_soon_to_edit?(scheduling)
      return error_result("Scheduling cannot be edited within #{lead_minutes_for(scheduling)} minutes", :unprocessable_entity)
    end

    diary.with_lock do
      if scheduling.update(date: params[:date], time: params[:time])
        return ServiceResult.new(
          success: true,
          payload: { scheduling: scheduling, user: user }
        )
      end

      ServiceResult.new(
        success: false,
        payload: { scheduling: scheduling, user: user },
        errors: scheduling.errors,
        status: :unprocessable_entity
      )
    end
  end

  private
  attr_reader :diary, :scheduling_id, :params

  def too_soon_to_edit?(scheduling)
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

  def error_result(message, status)
    ServiceResult.new(success: false, errors: message, status: status)
  end
end
