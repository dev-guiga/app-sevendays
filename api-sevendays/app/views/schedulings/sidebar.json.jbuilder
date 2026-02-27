json.success true
json.schedulings @schedulings do |scheduling|
  json.id scheduling.id
  json.diary_id scheduling.diary_id
  json.diary_title scheduling.diary&.title
  json.professional_name scheduling.diary&.user&.full_name
  json.date scheduling.date&.to_s
  json.time scheduling.time&.strftime("%H:%M")
  json.status scheduling.status
  json.description scheduling.description
end
