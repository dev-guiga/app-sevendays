class AddSessionDurationMinutesToSchedulings < ActiveRecord::Migration[8.1]
  def up
    add_column :schedulings, :session_duration_minutes, :integer

    if mysql_adapter?
      execute <<~SQL
        UPDATE schedulings
        INNER JOIN scheduling_rules ON schedulings.scheduling_rule_id = scheduling_rules.id
        SET schedulings.session_duration_minutes = scheduling_rules.session_duration_minutes
      SQL
    else
      execute <<~SQL
        UPDATE schedulings
        SET session_duration_minutes = scheduling_rules.session_duration_minutes
        FROM scheduling_rules
        WHERE schedulings.scheduling_rule_id = scheduling_rules.id
      SQL
    end

    change_column_default :schedulings, :session_duration_minutes, 60
    change_column_null :schedulings, :session_duration_minutes, false
  end

  def down
    remove_column :schedulings, :session_duration_minutes
  end

  private

  def mysql_adapter?
    connection.adapter_name.downcase.include?("mysql")
  end
end
