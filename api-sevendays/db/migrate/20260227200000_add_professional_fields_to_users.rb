class AddProfessionalFieldsToUsers < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :professional_description, :text
    add_column :users, :professional_document, :string
    add_column :users, :professional_branch, :string
  end
end
