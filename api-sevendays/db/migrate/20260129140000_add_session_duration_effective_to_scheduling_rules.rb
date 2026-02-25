class AddSessionDurationEffectiveToSchedulingRules < ActiveRecord::Migration[8.1]
  def change
    add_column :scheduling_rules, :session_duration_minutes_next, :integer
    add_column :scheduling_rules, :session_duration_effective_at, :datetime
  end
end
