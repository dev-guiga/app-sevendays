class AddUserToSchedulings < ActiveRecord::Migration[8.1]
  def change
    add_reference :schedulings, :user, null: false, foreign_key: true
  end
end
