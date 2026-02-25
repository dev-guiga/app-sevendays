class RenameOldColumnToNewColumn < ActiveRecord::Migration[8.1]
  def change
    change_column_default :schedulings, :status, from: "pending", to: "available"
  end
end
