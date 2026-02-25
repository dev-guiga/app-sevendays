class MoveUserAddressToAddresses < ActiveRecord::Migration[8.1]
  def up
    create_table :addresses do |t|
      t.references :user, null: false, index: { unique: true }, foreign_key: true
      t.string :address, null: false
      t.string :city, null: false
      t.string :state, null: false
      t.string :neighborhood, null: false
      t.timestamps
    end

    migrate_addresses_to_new_table

    remove_column :users, :address, :string
    remove_column :users, :city, :string
    remove_column :users, :state, :string
    remove_column :users, :neighborhood, :string
  end

  def down
    add_column :users, :address, :string
    add_column :users, :city, :string
    add_column :users, :state, :string
    add_column :users, :neighborhood, :string

    migrate_addresses_back_to_users

    drop_table :addresses
  end

  private

  def migrate_addresses_to_new_table
    return unless column_exists?(:users, :address)

    user_class = Class.new(ActiveRecord::Base) do
      self.table_name = "users"
    end

    address_class = Class.new(ActiveRecord::Base) do
      self.table_name = "addresses"
    end

    say_with_time "Backfilling addresses from users" do
      user_class.find_each do |user|
        next if address_blank?(user)

        address_class.create!(
          user_id: user.id,
          address: user.address,
          city: user.city,
          state: user.state,
          neighborhood: user.neighborhood,
          created_at: Time.current,
          updated_at: Time.current
        )
      end
    end
  end

  def migrate_addresses_back_to_users
    address_class = Class.new(ActiveRecord::Base) do
      self.table_name = "addresses"
    end

    user_class = Class.new(ActiveRecord::Base) do
      self.table_name = "users"
    end

    say_with_time "Restoring addresses to users" do
      address_class.find_each do |address|
        user = user_class.find_by(id: address.user_id)
        next unless user

        user.update_columns(
          address: address.address,
          city: address.city,
          state: address.state,
          neighborhood: address.neighborhood
        )
      end
    end
  end

  def address_blank?(user)
    [
      user.address,
      user.city,
      user.state,
      user.neighborhood
    ].all?(&:blank?)
  end
end
