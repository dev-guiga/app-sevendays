# frozen_string_literal: true

json.success true
json.diary_data do
  json.id @diary.id
  json.title @diary.title
  json.description @diary.description

  json.schedulings @schedulings.each do |s|
    json.id s.id
    json.date s.date
    json.start_time s.time.strftime("%H:%M")
    json.end_time s.time.strftime("%H:%M")
    json.status s.status
  end
end
