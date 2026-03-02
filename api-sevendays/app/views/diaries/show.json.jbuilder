# frozen_string_literal: true

professional = @diary.user
professional_document = professional&.professional_document
professional_document_type = professional_document.to_s[/[A-Za-z]+/]&.upcase

json.success true
json.diary_data do
  json.id @diary.id
  json.title @diary.title
  json.description @diary.description

  json.professional do
    json.id professional&.id
    json.name professional&.full_name
    json.email professional&.email
    json.branch professional&.professional_branch
    json.document professional_document
    json.document_type professional_document_type
    json.description professional&.professional_description
    json.address professional&.address&.address
    json.city professional&.address&.city
    json.state professional&.address&.state
    json.neighborhood professional&.address&.neighborhood
  end

  # Flat keys kept for backwards compatibility.
  json.user_name professional&.full_name
  json.user_email professional&.email
  json.address professional&.address&.address
  json.city professional&.address&.city
  json.state professional&.address&.state
  json.neighborhood professional&.address&.neighborhood
  json.professional_branch professional&.professional_branch
  json.professional_document professional_document
  json.professional_document_type professional_document_type
  json.professional_description professional&.professional_description

  json.schedulings @schedulings.each do |s|
    json.id s.id
    json.date s.date
    json.start_time s.time.strftime("%H:%M")
    json.end_time s.time.strftime("%H:%M")
    json.status s.status
  end
end
