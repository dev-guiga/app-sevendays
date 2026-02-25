class CreateUserSchedulingService
  def initialize(diary:, user:, params:)
    @diary = diary
    @user = user
    @params = params
  end

  def call
    return error_result("User must be non-owner", :forbidden) if user.owner?

    scheduling_rule = diary.scheduling_rule
    return error_result("Scheduling rule not found", :unprocessable_entity) unless scheduling_rule

    now = Time.current

    diary.with_lock do
      scheduling = diary.schedulings.new(
        user: user,
        scheduling_rule: scheduling_rule,
        date: params[:date],
        time: params[:time],
        description: description_for(params[:description]),
        status: "marked",
        created_at: now,
        updated_at: now
      )

      if scheduling.save
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
  attr_reader :diary, :user, :params

  def description_for(value)
    value.presence || "scheduling created by user"
  end

  def error_result(message, status)
    ServiceResult.new(success: false, errors: message, status: status)
  end
end
