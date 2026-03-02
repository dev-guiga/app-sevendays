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
      if pending_scheduling_exists?
        return error_result("Scheduling has a pending slot for this date and time", :unprocessable_entity)
      end

      scheduling = diary.schedulings.new(
        user: user,
        scheduling_rule: scheduling_rule,
        date: params[:date],
        time: params[:time],
        description: "scheduling created by owner",
        status: "pending",
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

  def pending_scheduling_exists?
    date = parse_date(params[:date])
    time = normalize_time(params[:time])
    return false if date.blank? || time.blank?

    diary.schedulings
      .active
      .where(date: date)
      .where("schedulings.status = ?", "pending")
      .where("TIME_FORMAT(schedulings.time, '%H:%i') = ?", time)
      .exists?
  end

  def parse_date(raw_value)
    value = raw_value.to_s.strip
    return if value.blank?
    return unless value.match?(/\A\d{4}-\d{2}-\d{2}\z/)

    Date.iso8601(value)
  rescue ArgumentError
    nil
  end

  def normalize_time(raw_value)
    value = raw_value.to_s.strip
    return if value.blank?
    return value if value.match?(/\A([01]\d|2[0-3]):[0-5]\d\z/)

    match = value.match(/\A([01]\d|2[0-3]):([0-5]\d):[0-5]\d\z/)
    return "#{match[1]}:#{match[2]}" if match
  end

  def error_result(message, status)
    ServiceResult.new(success: false, errors: message, status: status)
  end
end
