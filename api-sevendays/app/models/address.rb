class Address < ApplicationRecord
  belongs_to :user, inverse_of: :address

  validates :address, :city, :state, :neighborhood, presence: true
end
