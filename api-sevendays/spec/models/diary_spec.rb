require 'rails_helper'

RSpec.describe Diary, type: :model do
  def build_diary(overrides = {})
    Diary.new(
      {
        user: create_user!,
        title: Faker::Book.title,
        description: Faker::Lorem.characters(number: 20)
      }.merge(overrides)
    )
  end

  describe "validations" do
    it "is valid with required attributes" do
      expect(build_diary).to be_valid
    end

    it "is invalid without a user" do
      expect(build_diary(user: nil)).to be_invalid
    end

    it "is invalid without a title" do
      expect(build_diary(title: nil)).to be_invalid
    end

    it "is invalid without a description" do
      expect(build_diary(description: nil)).to be_invalid
    end

    it "is invalid with a too short description" do
      expect(build_diary(description: "short")).to be_invalid
    end

    it "enforces one diary per user" do
      user = create_user!
      Diary.create!(user: user, title: "One", description: Faker::Lorem.characters(number: 20))
      expect(build_diary(user: user)).to be_invalid
    end
  end
end
