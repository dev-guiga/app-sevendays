json.success true
json.schedulings @schedulings do |s|
  json.id s.id
  json.user_name s.user&.full_name
  json.date s.date
  json.time s.time
  json.status s.status
end
