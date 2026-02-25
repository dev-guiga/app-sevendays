require "rails_helper"

RSpec.describe DiariesController, type: :controller do
  render_views
    let(:user) { create_user! }

  describe "routing" do
    it "routes GET /api/diaries to diaries#index" do
      expect(get: "/api/diaries").to route_to("diaries#index")
    end

    it "routes GET /api/diaries/:id/days to diaries#days" do
      expect(get: "/api/diaries/1/days").to route_to("diaries#days", id: "1")
    end
  end

  describe "#index" do
    context "when authenticated" do
      before { sign_in(user) }
      let!(:diary) { create_diary!(user: user) }

      it "returns a list of diaries" do
        get :index, format: :json

        expect(response).to have_http_status(:ok)
        body = response.parsed_body
        expect(body["success"]).to eq(true)
        expect(body["diaries"].size).to eq(1)
        expect(body["diaries"].first["title"]).to eq(diary.title)
        expect(body["diaries"].first["description"]).to eq(diary.description)
      end
    end

    context "when unauthenticated" do
      it "returns unauthorized" do
        get :index, format: :json

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "#days" do
    let(:diary) { create_diary!(user: user) }
    let(:rule) {
      create_scheduling_rule!(
        user: user,
        diary: diary,
        overrides: {
          start_time: "09:00",
          end_time: "18:00",
          start_date: Date.current,
          end_date: Date.current + 7.days,
          week_days: (0..6).to_a
        }
      )
    }
    let(:target_date) { Date.current + 3.days }
    let!(:scheduling_in_day) {
      Scheduling.create!(
        scheduling_attributes(
          user: user,
          diary: diary,
          rule: rule,
          overrides: { date: target_date, time: "10:00" }
        )
      )
    }
    let!(:scheduling_other_day) {
      Scheduling.create!(
        scheduling_attributes(
          user: user,
          diary: diary,
          rule: rule,
          overrides: { date: target_date + 1.day, time: "10:00" }
        )
      )
    }

    context "when authenticated" do
      before { sign_in(user) }

      it "returns available slots for the requested day" do
        get :days, params: { id: diary.id, date: target_date.to_s }, format: :json

        expect(response).to have_http_status(:ok)
        body = response.parsed_body
        expect(body["success"]).to eq(true)
        expect(body["available_slots"].map { |slot| slot["start_time"] }).to include("09:00", "11:00")
        expect(body["available_slots"].map { |slot| slot["start_time"] }).not_to include("10:00")
      end

      it "returns 422 for invalid date" do
        get :days, params: { id: diary.id, date: "invalid-date" }, format: :json

        expect(response).to have_http_status(:unprocessable_entity)
        body = response.parsed_body
        expect(body.dig("error", "code")).to eq("invalid_date")
      end
    end

    context "when unauthenticated" do
      it "returns unauthorized" do
        get :days, params: { id: diary.id, date: target_date.to_s }, format: :json

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end
