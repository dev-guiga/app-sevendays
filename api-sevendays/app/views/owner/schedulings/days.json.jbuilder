# frozen_string_literal: true

json.success true
json.date @day
json.available_slots @available_slots do |slot|
  json.start_time slot[:start_time]
  json.end_time slot[:end_time]
end
