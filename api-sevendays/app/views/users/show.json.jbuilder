# frozen_string_literal: true

json.success true
json.user do
  json.id @user.id
  json.first_name @user.first_name
  json.last_name @user.last_name
  json.full_name @user.full_name
  json.username @user.username
  json.email @user.email
  json.status @user.status
  json.created_at @user.created_at
  json.updated_at @user.updated_at
  json.cpf @user.cpf
  json.birth_date @user.birth_date
  if @user.address.present?
    json.address do
      json.id @user.address.id
      json.address @user.address.address
      json.city @user.address.city
      json.state @user.address.state
      json.neighborhood @user.address.neighborhood
    end
  end
end
