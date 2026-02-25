# forzen_string_literal: true

json.success true
json.diary_data do
  json.title @diary.title
  json.description @diary.description
end
json.schedulings @schedulings do |s|
  json.user_name s.user&.full_name
  json.date s.date
  json.time s.time
  json.status s.status
end
