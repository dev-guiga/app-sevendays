json.success true
json.scheduling_rule do
  json.id @scheduling_rule.id
  json.start_time @scheduling_rule.start_time
  json.end_time @scheduling_rule.end_time
  json.session_duration_minutes @scheduling_rule.session_duration_minutes
  json.session_duration_minutes_next @scheduling_rule.session_duration_minutes_next
  json.session_duration_effective_at @scheduling_rule.session_duration_effective_at
  json.week_days @scheduling_rule.week_days
  json.start_date @scheduling_rule.start_date
  json.end_date @scheduling_rule.end_date
  json.diary_id @scheduling_rule.diary_id
  json.user_id @scheduling_rule.user_id
  json.updated_at @scheduling_rule.updated_at
end
