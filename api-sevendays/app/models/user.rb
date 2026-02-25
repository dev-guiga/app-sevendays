class User < ApplicationRecord
  before_validation { self.cpf = CPF.new(cpf).stripped if cpf.present? }
  devise :rememberable, :recoverable, :database_authenticatable, :validatable, :trackable, :registerable

  has_one :diary, dependent: :destroy, inverse_of: :user
  has_one :address, dependent: :destroy, inverse_of: :user
  has_many :scheduling_rules, dependent: :destroy, inverse_of: :user
  has_many :schedulings, dependent: :destroy, inverse_of: :user
  accepts_nested_attributes_for :address

  normalizes :email, with: ->(value) { value.downcase.strip }
  validates :email, uniqueness: true, presence: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :first_name, :email, :last_name, :birth_date, presence: true
  validates :username, uniqueness: true, presence: true, length: { minimum: 3, maximum: 20 }
  validates :cpf, uniqueness: true, presence: true
  validates :address, presence: true
  enum :status, { owner: 0, user: 1, standard: 2 }, default: 1

  def full_name
    "#{first_name} #{last_name}"
  end
end
