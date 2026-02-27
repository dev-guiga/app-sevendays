json.success true
json.schedulings @schedulings do |s|
  json.id s.id
  json.user_name s.user&.full_name
  json.user_email s.user&.email
  json.date s.date&.to_s
  json.time s.time&.strftime("%H:%M")
  json.status s.status
  json.description s.description
end

json.pagination do
  json.page @pagination[:page]
  json.per_page @pagination[:per_page]
  json.total_count @pagination[:total_count]
  json.total_pages @pagination[:total_pages]
  json.has_prev @pagination[:has_prev]
  json.has_next @pagination[:has_next]
end
