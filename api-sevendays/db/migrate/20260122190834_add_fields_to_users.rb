class AddFieldsToUsers < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :sign_in_count, :integer, default: 0, null: false unless column_exists?(:users, :sign_in_count)
    add_column :users, :current_sign_in_at, :datetime unless column_exists?(:users, :current_sign_in_at)
    add_column :users, :last_sign_in_at, :datetime unless column_exists?(:users, :last_sign_in_at)
    add_column :users, :current_sign_in_ip, :string unless column_exists?(:users, :current_sign_in_ip)
    add_column :users, :last_sign_in_ip, :string unless column_exists?(:users, :last_sign_in_ip)

    remove_column :users, :email_address, :string if column_exists?(:users, :email_address)
    add_column :users, :email, :string unless column_exists?(:users, :email)
  end
end
