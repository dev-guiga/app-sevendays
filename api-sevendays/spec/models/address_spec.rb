require 'rails_helper'

RSpec.describe Address, type: :model do
  let(:user) do
    create_user!
  end

  def build_address(overrides = {})
    Address.new(
      {
        address: Faker::Address.street_address,
        city: Faker::Address.city,
        state: Faker::Address.state_abbr,
        neighborhood: Faker::Address.community,
        user: user
      }.merge(overrides)
    )
  end

  describe "validations" do
    it "is valid with required attributes" do
      expect(build_address).to be_valid
    end

    it "is invalid without a user" do
      expect(build_address(user: nil)).to be_invalid
    end

    it "is invalid without an address" do
      expect(build_address(address: nil)).to be_invalid
    end

    it "is invalid without a city" do
      expect(build_address(city: nil)).to be_invalid
    end

    it "is invalid without a state" do
      expect(build_address(state: nil)).to be_invalid
    end

    it "is invalid without a neighborhood" do
      expect(build_address(neighborhood: nil)).to be_invalid
    end
  end
end
