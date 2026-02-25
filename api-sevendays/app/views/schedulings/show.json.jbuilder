json.success true
json.scheduling do
  json.id @scheduling.id
  json.diary_id @scheduling.diary_id
  json.date @scheduling.date
  json.time @scheduling.time
  json.status @scheduling.status
  json.description @scheduling.description
end
