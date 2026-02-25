require 'rails_helper'

RSpec.describe User, type: :model do
  def user_with_address(overrides = {}, address_overrides = {})
    User.new(
      {
        first_name: Faker::Name.first_name,
        last_name: Faker::Name.last_name,
        username: Faker::Internet.unique.username(specifier: 6),
        email: Faker::Internet.unique.email,
        password: "password123",
        password_confirmation: "password123",
        cpf: Faker::Number.unique.number(digits: 11).to_s,
        birth_date: Faker::Date.birthday(min_age: 18, max_age: 65),
        status: "user"
      }.merge(overrides)
    ).tap do |u|
      unless address_overrides == :skip
        u.build_address(
          {
            address: Faker::Address.street_address,
            city: Faker::Address.city,
            state: Faker::Address.state_abbr,
            neighborhood: Faker::Address.community
          }.merge(address_overrides)
        )
      end
    end
  end

  describe "validations" do
    it "is valid with required attributes" do
      expect(user_with_address).to be_valid
    end

    it "is invalid without a username" do
      expect(user_with_address(username: nil)).to be_invalid
    end

    it "is invalid without an email address" do
      expect(user_with_address(email: nil)).to be_invalid
    end

    it "is invalid without a first name" do
      expect(user_with_address(first_name: nil)).to be_invalid
    end

    it "is invalid without a last name" do
      expect(user_with_address(last_name: nil)).to be_invalid
    end

    it "is invalid without an address" do
      expect(user_with_address({}, :skip)).to be_invalid
    end

    it "is invalid without a birth date" do
      expect(user_with_address(birth_date: nil)).to be_invalid
    end

    it "is invalid without a cpf" do
      expect(user_with_address(cpf: nil)).to be_invalid
    end

    it "raises error with unsupported status" do
      expect { user_with_address(status: "invalid") }.to raise_error(ArgumentError)
    end

    it "enforces uniqueness of username" do
      existing = user_with_address(username: "dupuser")
      existing.save!
      expect(user_with_address(username: "dupuser", email: Faker::Internet.unique.email, cpf: Faker::Number.unique.number(digits: 11))).to be_invalid
    end

    it "enforces uniqueness of email" do
      email = Faker::Internet.unique.email
      user_with_address(email: email).save!
      expect(user_with_address(email: email, username: Faker::Internet.unique.username, cpf: Faker::Number.unique.number(digits: 11))).to be_invalid
    end

    it "enforces uniqueness of cpf" do
      cpf = Faker::Number.unique.number(digits: 11).to_s
      user_with_address(cpf: cpf).save!
      expect(user_with_address(cpf: cpf, email: Faker::Internet.unique.email, username: Faker::Internet.unique.username)).to be_invalid
    end
  end
end
