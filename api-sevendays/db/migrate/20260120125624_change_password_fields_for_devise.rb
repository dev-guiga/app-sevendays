class ChangePasswordFieldsForDevise < ActiveRecord::Migration[8.1]
  def change
     remove_column :users, :password_digest
    add_column :users, :encrypted_password, :string, null: false, default: ""
    add_column :users, :reset_password_token, :string
    add_column :users, :reset_password_sent_at, :datetime
    add_column :users, :remember_created_at, :datetime
    add_index :users, :reset_password_token, unique: true
  end
end
