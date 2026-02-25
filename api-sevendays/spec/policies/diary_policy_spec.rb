require "rails_helper"

RSpec.describe DiaryPolicy, type: :policy do
  subject(:policy) { described_class }

  let(:owner) { create_user!(status: "owner") }
  let(:user) { create_user!(status: "user") }

  permissions :create? do
    it "allows owners" do
      expect(policy).to permit(owner, Diary)
    end

    it "denies non-owners" do
      expect(policy).not_to permit(user, Diary)
    end
  end

  permissions :update? do
    it "allows owners" do
      expect(policy).to permit(owner, Diary)
    end

    it "denies non-owners" do
      expect(policy).not_to permit(user, Diary)
    end
  end

  permissions :schedule? do
    let(:diary) { create_diary!(user: owner) }

    it "allows the owner of the diary" do
      expect(policy).to permit(owner, diary)
    end

    it "denies other owners" do
      other_owner = create_user!(status: "owner")
      expect(policy).not_to permit(other_owner, diary)
    end

    it "denies non-owners" do
      expect(policy).not_to permit(user, diary)
    end
  end
end
