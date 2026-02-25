json.success true
json.diary do
  json.id @diary.id
  json.title @diary.title
  json.description @diary.description
  json.user_id @diary.user_id
  json.created_at @diary.created_at
  json.updated_at @diary.updated_at
end
json.scheduling_rule do
  json.id @scheduling_rule.id
  json.start_time @scheduling_rule.start_time
  json.end_time @scheduling_rule.end_time
  json.session_duration_minutes @scheduling_rule.session_duration_minutes
  json.week_days @scheduling_rule.week_days
  json.start_date @scheduling_rule.start_date
  json.end_date @scheduling_rule.end_date
  json.diary_id @scheduling_rule.diary_id
  json.user_id @scheduling_rule.user_id
  json.created_at @scheduling_rule.created_at
  json.updated_at @scheduling_rule.updated_at
end
