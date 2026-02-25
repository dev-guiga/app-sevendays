class CreateOwnerSchedulingService
  def initialize(diary:, params:)
    @diary = diary
    @params = params
  end

  def call
    user = User.find_by(email: params[:user_email])
    return error_result("User not found", :not_found) unless user
    return error_result("User must be non-owner", :unprocessable_entity) if user.owner?

    scheduling_rule = diary.scheduling_rule
    return error_result("Scheduling rule not found", :unprocessable_entity) unless scheduling_rule

    now = Time.current

    diary.with_lock do
      scheduling = diary.schedulings.new(
        user: user,
        scheduling_rule: scheduling_rule,
        date: params[:date],
        time: params[:time],
        description: "scheduling created by owner",
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
  attr_reader :diary, :params

  def error_result(message, status)
    ServiceResult.new(success: false, errors: message, status: status)
  end
end
