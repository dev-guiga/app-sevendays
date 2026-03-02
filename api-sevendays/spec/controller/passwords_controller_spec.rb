require "rails_helper"

RSpec.describe Devise::PasswordsController, type: :routing do
  it "routes POST /api/users/password to devise/passwords#create" do
    expect(post: "/api/users/password").to route_to("devise/passwords#create", format: :json)
  end

  it "routes PUT /api/users/password to devise/passwords#update" do
    expect(put: "/api/users/password").to route_to("devise/passwords#update", format: :json)
  end

  it "routes PATCH /api/users/password to devise/passwords#update" do
    expect(patch: "/api/users/password").to route_to("devise/passwords#update", format: :json)
  end
end
