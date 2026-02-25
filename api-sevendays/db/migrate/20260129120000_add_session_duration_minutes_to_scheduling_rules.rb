class AddSessionDurationMinutesToSchedulingRules < ActiveRecord::Migration[8.1]
  def change
    add_column :scheduling_rules, :session_duration_minutes, :integer, null: false, default: 60
  end
end
