json.success true
json.schedulings @schedulings do |s|
  json.id s.id
  json.diary_id s.diary_id
  json.diary_title s.diary&.title
  json.professional_name s.diary&.user&.full_name
  json.professional_email s.diary&.user&.email
  json.date s.date&.to_s
  json.time s.time&.strftime("%H:%M")
  json.status s.status
  json.description s.description
  json.created_at s.created_at
end

json.pagination do
  json.page @pagination[:page]
  json.per_page @pagination[:per_page]
  json.total_count @pagination[:total_count]
  json.total_pages @pagination[:total_pages]
  json.has_prev @pagination[:has_prev]
  json.has_next @pagination[:has_next]
end
