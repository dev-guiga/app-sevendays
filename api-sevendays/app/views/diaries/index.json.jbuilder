# frozen_string_literal: true

json.success true
json.diaries @diaries do |d|
  json.id d.id
  json.title d.title
  json.description d.description
end
