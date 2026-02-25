class CreateDiaryService
  def initialize(current_user:, diary_params:, scheduling_rule_params:)
    @current_user = current_user
    @diary_params = diary_params
    @scheduling_rule_params = scheduling_rule_params
  end

  def call
    diary = current_user.build_diary(diary_params)
    rule_params = SchedulingRule.apply_defaults(scheduling_rule_params)
    scheduling_rule = diary.build_scheduling_rule(rule_params.merge(user: current_user))

    if diary.valid? && scheduling_rule.valid?
      Diary.transaction do
        diary.save!
        scheduling_rule.save!
      end

      return ServiceResult.new(
        success: true,
        payload: { diary: diary, scheduling_rule: scheduling_rule }
      )
    end

    ServiceResult.new(
      success: false,
      payload: { diary: diary, scheduling_rule: scheduling_rule },
      errors: { diary: diary.errors, scheduling_rule: scheduling_rule.errors },
      status: :unprocessable_entity
    )
  end

  private
  attr_reader :current_user, :diary_params, :scheduling_rule_params
end
