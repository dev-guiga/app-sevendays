require "rails_helper"

RSpec.describe SchedulingsController, type: :controller do
  render_views
  include ActiveSupport::Testing::TimeHelpers

  let(:owner) { create_user!(status: "owner") }
  let(:user) { create_user!(status: "user", email: "user@example.com") }
  let(:other_user) { create_user!(status: "user", email: "other@example.com") }
  let(:diary) { create_diary!(user: owner) }
  let(:scheduling_rule) { create_scheduling_rule!(user: owner, diary: diary) }
  let(:description) { "Consulta de rotina com detalhes" }
  let(:scheduled_at) do
    date = Date.current + 1.day
    Time.zone.local(date.year, date.month, date.day, 10, 0, 0)
  end
  let(:scheduling_params) do
    {
      diary_id: diary.id,
      scheduling: {
        date: scheduled_at.to_date.to_s,
        time: scheduled_at.strftime("%H:%M"),
        description: description
      }
    }
  end

  describe "routing" do
    it "routes POST /api/diaries/:diary_id/schedulings to schedulings#create" do
      expect(post: "/api/diaries/1/schedulings").to route_to("schedulings#create", diary_id: "1")
    end

    it "routes GET /api/diaries/:diary_id/schedulings to schedulings#index" do
      expect(get: "/api/diaries/1/schedulings").to route_to("schedulings#index", diary_id: "1")
    end

    it "routes GET /api/diaries/:diary_id/schedulings/:id to schedulings#show" do
      expect(get: "/api/diaries/1/schedulings/2").to route_to("schedulings#show", diary_id: "1", id: "2")
    end

    it "routes PATCH /api/diaries/:diary_id/schedulings/:id to schedulings#update" do
      expect(patch: "/api/diaries/1/schedulings/2").to route_to("schedulings#update", diary_id: "1", id: "2")
    end

    it "routes DELETE /api/diaries/:diary_id/schedulings/:id to schedulings#destroy" do
      expect(delete: "/api/diaries/1/schedulings/2").to route_to("schedulings#destroy", diary_id: "1", id: "2")
    end
  end

  describe "#create" do
    context "when authorized" do
      before do
        sign_in(user)
        scheduling_rule
      end

      it "creates a scheduling for the user and returns data" do
        expect {
          post :create, params: scheduling_params, format: :json
        }.to change(Scheduling, :count).by(1)

        expect(response).to have_http_status(:created)
        body = response.parsed_body
        expect(body["success"]).to eq(true)
        expect(body["user_email"]).to eq(user.email)
        expect(body["date"]).to eq(scheduled_at.to_date.to_s)
        expect(body["time"]).to be_present
        expect(body["status"]).to eq("marked")
        expect(body["description"]).to eq(description)

        created = Scheduling.last
        expect(created.user_id).to eq(user.id)
        expect(created.diary_id).to eq(diary.id)
        expect(created.scheduling_rule_id).to eq(scheduling_rule.id)
        expect(created.status).to eq("marked")
      end
    end

    context "when time is within lead time for short sessions" do
      let(:scheduling_rule) {
        create_scheduling_rule!(
          user: owner,
          diary: diary,
          overrides: {
            session_duration_minutes: 30
          }
        )
      }
      let(:too_soon_at) { Time.current.beginning_of_hour + 30.minutes }

      around do |example|
        travel_to(Time.zone.local(2026, 1, 1, 10, 10, 0)) { example.run }
      end

      before do
        sign_in(user)
        scheduling_rule
      end

      it "returns unprocessable entity" do
        post :create, params: {
          diary_id: diary.id,
          scheduling: {
            date: too_soon_at.to_date.to_s,
            time: too_soon_at.strftime("%H:%M"),
            description: description
          }
        }, format: :json

        expect(response).to have_http_status(:unprocessable_entity)
      end
    end

    context "when scheduling rule is missing" do
      before { sign_in(user) }

      it "returns unprocessable entity" do
        post :create, params: scheduling_params, format: :json

        expect(response).to have_http_status(:unprocessable_entity)
      end
    end

    context "when current user is owner" do
      before { sign_in(owner) }

      it "returns forbidden" do
        post :create, params: scheduling_params, format: :json

        expect(response).to have_http_status(:forbidden)
      end
    end

    context "when diary does not exist" do
      before do
        sign_in(user)
        scheduling_rule
      end

      it "returns not found" do
        post :create, params: scheduling_params.merge(diary_id: 999_999), format: :json

        expect(response).to have_http_status(:not_found)
      end
    end

    context "when unauthenticated" do
      it "returns unauthorized" do
        post :create, params: scheduling_params, format: :json

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "#index" do
    let!(:user_scheduling) {
      Scheduling.create!(
        scheduling_attributes(
          user: user,
          diary: diary,
          rule: scheduling_rule,
          overrides: {
            date: scheduled_at.to_date,
            time: scheduled_at.strftime("%H:%M"),
            status: "marked"
          }
        )
      )
    }
    let!(:other_scheduling) {
      Scheduling.create!(
        scheduling_attributes(
          user: other_user,
          diary: diary,
          rule: scheduling_rule,
          overrides: {
            date: scheduled_at.to_date,
            time: "11:00",
            status: "marked"
          }
        )
      )
    }

    context "when authorized" do
      before do
        sign_in(user)
        scheduling_rule
      end

      it "returns only user schedulings" do
        get :index, params: { diary_id: diary.id }, format: :json

        expect(response).to have_http_status(:ok)
        body = response.parsed_body
        expect(body["success"]).to eq(true)
        expect(body["schedulings"].size).to eq(1)
        expect(body["schedulings"].first["id"]).to eq(user_scheduling.id)
      end
    end

    context "when current user is owner" do
      before { sign_in(owner) }

      it "returns forbidden" do
        get :index, params: { diary_id: diary.id }, format: :json

        expect(response).to have_http_status(:forbidden)
      end
    end

    context "when diary does not exist" do
      before { sign_in(user) }

      it "returns not found" do
        get :index, params: { diary_id: 999_999 }, format: :json

        expect(response).to have_http_status(:not_found)
      end
    end

    context "when unauthenticated" do
      it "returns unauthorized" do
        get :index, params: { diary_id: diary.id }, format: :json

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "#show" do
    let!(:scheduling) {
      Scheduling.create!(
        scheduling_attributes(
          user: user,
          diary: diary,
          rule: scheduling_rule,
          overrides: {
            date: scheduled_at.to_date,
            time: scheduled_at.strftime("%H:%M"),
            status: "marked"
          }
        )
      )
    }

    context "when authorized" do
      before do
        sign_in(user)
        scheduling_rule
      end

      it "returns scheduling details" do
        get :show, params: { diary_id: diary.id, id: scheduling.id }, format: :json

        expect(response).to have_http_status(:ok)
        body = response.parsed_body
        expect(body["success"]).to eq(true)
        expect(body["scheduling"]["id"]).to eq(scheduling.id)
        expect(body["scheduling"]["status"]).to eq("marked")
      end
    end

    context "when scheduling does not belong to user" do
      let!(:other_scheduling) {
        Scheduling.create!(
          scheduling_attributes(
            user: other_user,
            diary: diary,
            rule: scheduling_rule,
            overrides: {
              date: scheduled_at.to_date,
              time: "11:00",
              status: "marked"
            }
          )
        )
      }

      before do
        sign_in(user)
        scheduling_rule
      end

      it "returns not found" do
        get :show, params: { diary_id: diary.id, id: other_scheduling.id }, format: :json

        expect(response).to have_http_status(:not_found)
      end
    end

    context "when current user is owner" do
      before { sign_in(owner) }

      it "returns forbidden" do
        get :show, params: { diary_id: diary.id, id: scheduling.id }, format: :json

        expect(response).to have_http_status(:forbidden)
      end
    end

    context "when scheduling does not exist" do
      before { sign_in(user) }

      it "returns not found" do
        get :show, params: { diary_id: diary.id, id: 999_999 }, format: :json

        expect(response).to have_http_status(:not_found)
      end
    end

    context "when unauthenticated" do
      it "returns unauthorized" do
        get :show, params: { diary_id: diary.id, id: scheduling.id }, format: :json

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "#update" do
    let(:new_scheduled_at) do
      date = Date.current + 2.days
      Time.zone.local(date.year, date.month, date.day, 11, 0, 0)
    end
    let!(:scheduling) {
      Scheduling.create!(
        scheduling_attributes(
          user: user,
          diary: diary,
          rule: scheduling_rule,
          overrides: {
            date: scheduled_at.to_date,
            time: scheduled_at.strftime("%H:%M"),
            status: "marked"
          }
        )
      )
    }
    let(:update_params) do
      {
        diary_id: diary.id,
        id: scheduling.id,
        scheduling: {
          date: new_scheduled_at.to_date.to_s,
          time: new_scheduled_at.strftime("%H:%M"),
          description: "Atualizado com detalhes"
        }
      }
    end

    context "when authorized" do
      before do
        sign_in(user)
        scheduling_rule
      end

      it "updates the scheduling and returns data" do
        patch :update, params: update_params, format: :json

        expect(response).to have_http_status(:ok)
        body = response.parsed_body
        expect(body["success"]).to eq(true)
        expect(body["user_email"]).to eq(user.email)
        expect(body["date"]).to eq(new_scheduled_at.to_date.to_s)
        expect(body["time"]).to be_present

        scheduling.reload
        expect(scheduling.date).to eq(new_scheduled_at.to_date)
      end
    end

    context "when editing within lead time for short sessions" do
      let(:scheduling_rule) {
        create_scheduling_rule!(
          user: owner,
          diary: diary,
          overrides: {
            session_duration_minutes: 30
          }
        )
      }

      around do |example|
        travel_to(Time.zone.local(2026, 1, 1, 10, 10, 0)) { example.run }
      end

      before do
        sign_in(user)
        scheduling_rule
        too_soon_at = Time.current.beginning_of_hour + 30.minutes
        scheduling.update_columns(
          date: too_soon_at.to_date,
          time: too_soon_at
        )
      end

      it "returns unprocessable entity" do
        patch :update, params: update_params, format: :json

        expect(response).to have_http_status(:unprocessable_entity)
      end
    end

    context "when scheduling is not found" do
      before do
        sign_in(user)
        scheduling_rule
      end

      it "returns not found" do
        patch :update, params: update_params.merge(id: 999_999), format: :json

        expect(response).to have_http_status(:not_found)
      end
    end

    context "when scheduling does not belong to user" do
      let!(:other_scheduling) {
        Scheduling.create!(
          scheduling_attributes(
            user: other_user,
            diary: diary,
            rule: scheduling_rule,
            overrides: {
              date: scheduled_at.to_date,
              time: "11:00",
              status: "marked"
            }
          )
        )
      }

      before do
        sign_in(user)
        scheduling_rule
      end

      it "returns unprocessable entity" do
        patch :update, params: update_params.merge(id: other_scheduling.id), format: :json

        expect(response).to have_http_status(:unprocessable_entity)
      end
    end

    context "when current user is owner" do
      before { sign_in(owner) }

      it "returns forbidden" do
        patch :update, params: update_params, format: :json

        expect(response).to have_http_status(:forbidden)
      end
    end

    context "when diary does not exist" do
      before { sign_in(user) }

      it "returns not found" do
        patch :update, params: update_params.merge(diary_id: 999_999), format: :json

        expect(response).to have_http_status(:not_found)
      end
    end

    context "when unauthenticated" do
      it "returns unauthorized" do
        patch :update, params: update_params, format: :json

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "#destroy" do
    let!(:scheduling) {
      Scheduling.create!(
        scheduling_attributes(
          user: user,
          diary: diary,
          rule: scheduling_rule,
          overrides: {
            date: scheduled_at.to_date,
            time: scheduled_at.strftime("%H:%M"),
            status: "marked"
          }
        )
      )
    }

    context "when authorized" do
      before do
        sign_in(user)
        scheduling_rule
      end

      it "cancels the scheduling and returns data" do
        delete :destroy, params: { diary_id: diary.id, id: scheduling.id }, format: :json

        expect(response).to have_http_status(:ok)
        body = response.parsed_body
        expect(body["success"]).to eq(true)
        expect(body["user_email"]).to eq(user.email)
        expect(body["status"]).to eq("cancelled")

        scheduling.reload
        expect(scheduling).to be_cancelled
      end
    end

    context "when cancelling within lead time for short sessions" do
      let(:scheduling_rule) {
        create_scheduling_rule!(
          user: owner,
          diary: diary,
          overrides: {
            session_duration_minutes: 30
          }
        )
      }

      around do |example|
        travel_to(Time.zone.local(2026, 1, 1, 10, 10, 0)) { example.run }
      end

      before do
        sign_in(user)
        scheduling_rule
        too_soon_at = Time.current.beginning_of_hour + 30.minutes
        scheduling.update_columns(
          date: too_soon_at.to_date,
          time: too_soon_at
        )
      end

      it "returns unprocessable entity" do
        delete :destroy, params: { diary_id: diary.id, id: scheduling.id }, format: :json

        expect(response).to have_http_status(:unprocessable_entity)
      end
    end

    context "when scheduling is not found" do
      before do
        sign_in(user)
        scheduling_rule
      end

      it "returns not found" do
        delete :destroy, params: { diary_id: diary.id, id: 999_999 }, format: :json

        expect(response).to have_http_status(:not_found)
      end
    end

    context "when scheduling does not belong to user" do
      let!(:other_scheduling) {
        Scheduling.create!(
          scheduling_attributes(
            user: other_user,
            diary: diary,
            rule: scheduling_rule,
            overrides: {
              date: scheduled_at.to_date,
              time: "11:00",
              status: "marked"
            }
          )
        )
      }

      before do
        sign_in(user)
        scheduling_rule
      end

      it "returns unprocessable entity" do
        delete :destroy, params: { diary_id: diary.id, id: other_scheduling.id }, format: :json

        expect(response).to have_http_status(:unprocessable_entity)
      end
    end

    context "when current user is owner" do
      before { sign_in(owner) }

      it "returns forbidden" do
        delete :destroy, params: { diary_id: diary.id, id: scheduling.id }, format: :json

        expect(response).to have_http_status(:forbidden)
      end
    end

    context "when diary does not exist" do
      before { sign_in(user) }

      it "returns not found" do
        delete :destroy, params: { diary_id: 999_999, id: scheduling.id }, format: :json

        expect(response).to have_http_status(:not_found)
      end
    end

    context "when unauthenticated" do
      it "returns unauthorized" do
        delete :destroy, params: { diary_id: diary.id, id: scheduling.id }, format: :json

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end
