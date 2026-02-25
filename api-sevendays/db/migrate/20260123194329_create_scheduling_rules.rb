class CreateSchedulingRules < ActiveRecord::Migration[8.1]
  def change
    create_table :scheduling_rules do |t|
      t.references :diary, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.date :start_date
      t.date :end_date
      t.time :start_time, null: false
      t.time :end_time, null: false
      t.json :week_days, null: false
      t.timestamps
    end
    add_index :scheduling_rules, [ :diary_id, :user_id ], unique: true
  end
end
