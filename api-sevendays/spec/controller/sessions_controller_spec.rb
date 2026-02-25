require "rails_helper"

RSpec.describe Devise::SessionsController, type: :controller do
  let(:params) { { user: { email: email, password: password } } }
  let!(:user) { create_user!(email: Faker::Internet.unique.email) }
  let(:email) { user.email }
  let(:password) { "password123" }

  render_views

  before do
    @request.env["devise.mapping"] = Devise.mappings[:user]
  end

  describe "routes" do
    it "routes POST /api/users/sign_in to devise/sessions#create" do
      expect(post: "/api/users/sign_in").to route_to("devise/sessions#create")
    end

    it "routes DELETE /api/users/sign_out to devise/sessions#destroy" do
      expect(delete: "/api/users/sign_out").to route_to("devise/sessions#destroy")
    end
  end

  describe "POST #create" do
    subject(:perform_request) do
      post :create, params: params, format: :json
    end


    context "with valid credentials" do
      it "returns ok with success message" do
        perform_request

        expect(response).to have_http_status(:ok)
        expect(response.parsed_body["message"]).to eq("Signed in successfully")
      end
    end

    context "with invalid email" do
      let(:email) { "naoexiste@test.com" }

      it "returns unauthorized with error message" do
        perform_request

        expect(response).to have_http_status(:unauthorized)
        error = response.parsed_body["error"]
        expect(error["code"]).to eq("unauthorized")
        expect(error["message"]).to eq("Invalid email or password")
      end
    end

    context "with invalid password" do
      let(:password) { "senhaerrada" }

      it "returns unauthorized with error message" do
        perform_request

        expect(response).to have_http_status(:unauthorized)
        error = response.parsed_body["error"]
        expect(error["code"]).to eq("unauthorized")
        expect(error["message"]).to eq("Invalid email or password")
      end
    end
  end

  describe "DELETE #destroy" do
    subject(:perform_request) do
      delete :destroy, params: params, format: :json
    end

    let!(:user) { create_user!(email: Faker::Internet.unique.email) }
    let(:params) { { user: { email: user.email, password: "password123" } } }

    it "returns no content" do
      perform_request

      expect(response).to have_http_status(:no_content)
    end
  end
end
