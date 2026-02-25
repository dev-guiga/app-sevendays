require "rails_helper"

RSpec.describe UsersController, type: :controller do
  let(:params) { user_params }
  let(:user) { create_user!(user_params(email: Faker::Internet.unique.email, password: "password123", password_confirmation: "password123")) }

  render_views

  def user_params(overrides = {})
    user_attributes({ status: "owner" }.merge(overrides))
  end

  describe "routing" do
    it "routes POST /api/users to users#create" do
      expect(post: "/api/users").to route_to("users#create")
    end
    it "routes GET /api/user to users#show" do
      expect(get: "/api/user").to route_to("users#show")
    end
  end

  describe "#create" do
    context "when success" do
      it "creates a user and returns 201" do
        expect {
          post :create, params: { user: params }, format: :json
        }.to change(User, :count).by(1)

        expect(response).to have_http_status(:created)
        created = User.last
        expect(created.username).to eq(params[:username])
        expect(created.address.address).to eq(params[:address_attributes][:address])
      end
    end

    context "when status is not provided" do
      let(:valid_attributes) { user_attributes.except(:status) }

      it "defaults to user" do
        post :create, params: { user: valid_attributes }, format: :json
        user = User.last

        expect(user.status).to eq("user")
      end
    end

    context "when status is provided as user" do
      let(:valid_attributes) { user_attributes(status: "user") }

      it "keeps user status" do
        post :create, params: { user: valid_attributes }, format: :json
        user = User.last

        expect(user.status).to eq("user")
      end
    end

    context "when status is provided as standard" do
      let(:valid_attributes) { user_attributes(status: "standard") }

      it "forces status to user" do
        post :create, params: { user: valid_attributes }, format: :json
        user = User.last

        expect(user.status).to eq("user")
      end
    end

    context "with invalid parameters" do
      let(:invalid_attributes) {
        {
          first_name: "",
          username: "",
          last_name: "",
          email: ""
        }
      }
      before do
        post :create, params: { user: invalid_attributes }, format: :json
      end

      it "does not create a user" do
        expect(User.count).to eq(0)
      end

      it "returns 422 with validation errors" do
        expect(response).to have_http_status(:unprocessable_entity)
        details = response.parsed_body.dig("error", "details")
        expect(details).to include("first_name", "email", "username")
      end
    end

    context "when username already exists" do
      before { create_user!(user_params(username: "duplicate", email: Faker::Internet.unique.email, cpf: Faker::Number.unique.number(digits: 11).to_s)) }

      it "returns 422 and does not create user" do
        expect {
          post :create, params: { user: user_params(username: "duplicate") }, format: :json
        }.not_to change(User, :count)
        expect(response).to have_http_status(:unprocessable_entity)
        expect(response.parsed_body.dig("error", "details", "username")).to include("has already been taken")
      end
    end

    context "when email already exists" do
      let(:email) { Faker::Internet.unique.email }
      before { create_user!(user_params(email: email, username: Faker::Internet.unique.username, cpf: Faker::Number.unique.number(digits: 11).to_s)) }

      it "returns 422 and does not create user" do
        expect {
          post :create, params: { user: user_params(email: email) }, format: :json
        }.not_to change(User, :count)
        expect(response).to have_http_status(:unprocessable_entity)
        expect(response.parsed_body.dig("error", "details", "email")).to include("has already been taken")
      end
    end

    context "when CPF already exists" do
      let(:cpf) { Faker::Number.unique.number(digits: 11).to_s }
      before { create_user!(user_params(cpf: cpf, email: Faker::Internet.unique.email, username: Faker::Internet.unique.username)) }

      it "returns 422 and does not create user" do
        expect {
          post :create, params: { user: user_params(cpf: cpf) }, format: :json
        }.not_to change(User, :count)
        expect(response).to have_http_status(:unprocessable_entity)
        expect(response.parsed_body.dig("error", "details", "cpf")).to include("has already been taken")
      end
    end
  end

  describe "#show" do
    subject(:perform_request) { get :show, format: :json }

    context "when authenticated" do
      before { sign_in(user) }

      it "returns the current user" do
        perform_request
        expect(response).to have_http_status(:ok)
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
