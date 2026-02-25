class ResetOwnerSchedulingRuleService
  def initialize(diary:, user:)
    @diary = diary
    @user = user
  end

  def call
    defaults = SchedulingRule.default_attributes

    diary.with_lock do
      scheduling_rule = diary.scheduling_rule

      if scheduling_rule
        scheduling_rule.assign_attributes(defaults)
        scheduling_rule.start_date = nil
        scheduling_rule.end_date = nil
        scheduling_rule.session_duration_minutes_next = nil
        scheduling_rule.session_duration_effective_at = nil

        # Skip validation to avoid queuing duration changes on reset.
        if scheduling_rule.save(validate: false)
          return ServiceResult.new(
            success: true,
            payload: { scheduling_rule: scheduling_rule }
          )
        end

        return ServiceResult.new(
          success: false,
          payload: { scheduling_rule: scheduling_rule },
          errors: { scheduling_rule: scheduling_rule.errors },
          status: :unprocessable_entity
        )
      end

      scheduling_rule = diary.build_scheduling_rule(defaults.merge(user: user))

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
  end

  private
  attr_reader :diary, :user
end
