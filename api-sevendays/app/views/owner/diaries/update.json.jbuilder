json.success true
json.diary do
  json.id @diary.id
  json.title @diary.title
  json.description @diary.description
  json.user_id @diary.user_id
  json.created_at @diary.created_at
  json.updated_at @diary.updated_at
end
