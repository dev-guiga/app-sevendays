class CreateSchedulings < ActiveRecord::Migration[8.1]
  def change
    create_table :schedulings do |t|
      t.references :diary, null: false, foreign_key: true
      t.references :scheduling_rule, null: false, foreign_key: true
      t.date :date, null: false
      t.time :time, null: false
      t.text :description, null: false, limit: 1000
      t.string :status, null: false, default: 'pending'
      t.timestamps
    end
  end
end
