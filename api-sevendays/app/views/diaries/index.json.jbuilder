# frozen_string_literal: true

json.success true
json.diaries @diaries do |d|
  professional = d.user
  professional_document = professional&.professional_document
  professional_document_type = professional_document.to_s[/[A-Za-z]+/]&.upcase

  json.id d.id
  json.title d.title
  json.description d.description
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
end

json.pagination do
  json.page @pagination[:page]
  json.per_page @pagination[:per_page]
  json.total_count @pagination[:total_count]
  json.total_pages @pagination[:total_pages]
  json.has_prev @pagination[:has_prev]
  json.has_next @pagination[:has_next]
end
