class AddEmailNotNullToUsers < ActiveRecord::Migration[8.1]
  def change
    change_column_null :users, :email, false
  end
end
