require "rails_helper"

RSpec.describe CreateUserService, type: :service do
  subject(:result) { described_class.new(params).call }

  let(:params) { ActionController::Parameters.new(attributes) }
  let(:attributes) { user_attributes(status: status) }
  let(:status) { "owner" }

  context "with valid params" do
    it "creates a user with normalized status" do
      expect { result }.to change(User, :count).by(1)

      expect(result).to be_success
      expect(result.payload[:user]).to be_owner
    end
  end

  context "with non-owner status" do
    let(:status) { "standard" }

    it "forces status to user" do
      result

      expect(result).to be_success
      expect(result.payload[:user]).to be_user
    end
  end

  context "with invalid params" do
    let(:attributes) { user_attributes.merge(email: nil) }

    it "returns validation errors" do
      expect { result }.not_to change(User, :count)

      expect(result).not_to be_success
      expect(result.errors[:email]).to be_present
    end
  end
end
