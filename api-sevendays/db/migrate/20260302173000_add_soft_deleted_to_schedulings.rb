class AddSoftDeletedToSchedulings < ActiveRecord::Migration[8.1]
  def up
    add_column :schedulings, :soft_deleted, :boolean, null: false, default: false
    add_index :schedulings, :soft_deleted

    execute <<~SQL.squish
      UPDATE schedulings
      SET soft_deleted = TRUE
      WHERE status = 'cancelled'
    SQL
  end

  def down
    remove_index :schedulings, :soft_deleted
    remove_column :schedulings, :soft_deleted
  end
end
