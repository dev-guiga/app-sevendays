class CreateOwnerSchedulingRuleService
  def initialize(diary:, params:, user:)
    @diary = diary
    @params = params
    @user = user
  end

  def call
    return error_result("Scheduling rule already exists", :unprocessable_entity) if diary.scheduling_rule.present?

    rule_params = SchedulingRule.apply_defaults(params).merge(user: user)
    scheduling_rule = diary.build_scheduling_rule(rule_params)

    if scheduling_rule.save
      return ServiceResult.new(
        success: true,
        payload: { scheduling_rule: scheduling_rule }
      )
    end

    ServiceResult.new(
      success: false,
      payload: { scheduling_rule: scheduling_rule },
      errors: { scheduling_rule: scheduling_rule.errors },
      status: :unprocessable_entity
    )
  end

  private
  attr_reader :diary, :params, :user

  def error_result(message, status)
    ServiceResult.new(success: false, errors: message, status: status)
  end
end
