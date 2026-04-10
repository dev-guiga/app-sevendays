class AddAvatarStorageKeyToUsers < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :avatar_storage_key, :string
  end
end
