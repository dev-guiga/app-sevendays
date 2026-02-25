require "rails_helper"

RSpec.describe "Authentication", type: :request do
  describe "POST /api/users/sign_in" do
    subject(:perform_request) { post "/api/users/sign_in", params: params, as: :json }

    let!(:user) { create_user!(email: "user@example.com") }
    let(:params) { { user: { email: user.email, password: password } } }
    let(:password) { "password123" }

    context "with valid credentials" do
      it "returns ok" do
        perform_request

        expect(response).to have_http_status(:ok)
        expect(response.parsed_body["message"]).to eq("Signed in successfully")
      end
    end

    context "with invalid password" do
      let(:password) { "wrong" }

      it "returns unauthorized" do
        perform_request

        expect(response).to have_http_status(:unauthorized)
        expect(response.parsed_body.dig("error", "code")).to eq("unauthorized")
      end
    end
  end

  describe "GET /api/user" do
    subject(:perform_request) { get "/api/user", as: :json }

    let(:user) { create_user!(email: "current@example.com") }

    context "when authenticated" do
      before { sign_in(user) }

      it "returns the current user" do
        perform_request

        expect(response).to have_http_status(:ok)
        expect(response.parsed_body.dig("user", "email")).to eq(user.email)
      end
    end

    context "when unauthenticated" do
      it "returns unauthorized" do
        perform_request

        expect(response).to have_http_status(:unauthorized)
        expect(response.parsed_body.dig("error", "code")).to eq("unauthorized")
      end
    end
  end
end
