class AddFieldsToUser < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :first_name, :string
    add_column :users, :last_name, :string
    add_column :users, :username, :string
    add_column :users, :email, :string
    add_column :users, :password, :string
    add_column :users, :cpf, :string
    add_column :users, :address, :string
    add_column :users, :city, :string
    add_column :users, :state, :string
    add_column :users, :neighborhood, :string
    add_column :users, :birth_date, :date
    add_column :users, :status, :integer, default: 1

    add_index :users, :cpf, unique: true
    add_index :users, :email, unique: true
    add_index :users, :username, unique: true
  end
end
