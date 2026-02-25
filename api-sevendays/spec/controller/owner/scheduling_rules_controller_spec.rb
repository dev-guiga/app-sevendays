require "rails_helper"

RSpec.describe Owner::SchedulingRulesController, type: :controller do
  render_views

  let(:owner) { create_user!(status: "owner") }
  let(:user) { create_user!(status: "user") }
  let(:diary) { create_diary!(user: owner) }
  let(:scheduling_rule) {
    create_scheduling_rule!(
      user: owner,
      diary: diary,
      overrides: {
        start_time: "09:00",
        end_time: "18:00",
        session_duration_minutes: 60,
        week_days: (0..6).to_a,
        start_date: Date.current,
        end_date: Date.current + 7.days
      }
    )
  }
  let(:scheduled_at) do
    date = Date.current + 1.day
    Time.zone.local(date.year, date.month, date.day, 10, 0, 0)
  end

  describe "routing" do
    it "routes PATCH /api/owner/diary/scheduling_rule to owner/scheduling_rules#update" do
      expect(patch: "/api/owner/diary/scheduling_rule").to route_to("owner/scheduling_rules#update")
    end

    it "routes GET /api/owner/diary/scheduling_rule to owner/scheduling_rules#show" do
      expect(get: "/api/owner/diary/scheduling_rule").to route_to("owner/scheduling_rules#show")
    end

    it "routes POST /api/owner/diary/scheduling_rule to owner/scheduling_rules#create" do
      expect(post: "/api/owner/diary/scheduling_rule").to route_to("owner/scheduling_rules#create")
    end

    it "routes DELETE /api/owner/diary/scheduling_rule to owner/scheduling_rules#destroy" do
      expect(delete: "/api/owner/diary/scheduling_rule").to route_to("owner/scheduling_rules#destroy")
    end
  end

  describe "#show" do
    context "when authorized" do
      before do
        sign_in(owner)
        scheduling_rule
      end

      it "returns the scheduling rule" do
        get :show, format: :json

        expect(response).to have_http_status(:ok)
        body = response.parsed_body
        expect(body["success"]).to eq(true)
        expect(body.dig("scheduling_rule", "id")).to eq(scheduling_rule.id)
        expect(body.dig("scheduling_rule", "start_time")).to be_present
        expect(body.dig("scheduling_rule", "end_time")).to be_present
      end
    end

    context "when scheduling rule does not exist" do
      let(:owner_without_rule) { create_user!(status: "owner") }
      let!(:owner_diary_without_rule) { create_diary!(user: owner_without_rule) }

      before { sign_in(owner_without_rule) }

      it "returns not found" do
        get :show, format: :json

        expect(response).to have_http_status(:not_found)
      end
    end

    context "when current user is not owner" do
      let(:non_owner) { create_user!(status: "user") }
      let!(:non_owner_diary) { create_diary!(user: non_owner) }

      before { sign_in(non_owner) }

      it "returns forbidden" do
        get :show, format: :json

        expect(response).to have_http_status(:forbidden)
      end
    end

    context "when diary does not exist" do
      let(:owner_without_diary) { create_user!(status: "owner") }

      before { sign_in(owner_without_diary) }

      it "returns not found" do
        get :show, format: :json

        expect(response).to have_http_status(:not_found)
      end
    end

    context "when unauthenticated" do
      it "returns unauthorized" do
        get :show, format: :json

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "#update" do
    context "when authorized" do
      before do
        sign_in(owner)
        scheduling_rule
      end

      it "updates the scheduling rule" do
        patch :update,
              params: { scheduling_rules: { start_time: "08:00", end_time: "18:00" } },
              format: :json

        expect(response).to have_http_status(:ok)
        body = response.parsed_body
        expect(body["success"]).to eq(true)
        expect(body.dig("scheduling_rule", "start_time")).to be_present
      end
    end

    context "when update conflicts with existing schedulings" do
      before do
        sign_in(owner)
        scheduling_rule
        Scheduling.create!(
          scheduling_attributes(
            user: user,
            diary: diary,
            rule: scheduling_rule,
            overrides: {
              date: scheduled_at.to_date,
              time: scheduled_at.strftime("%H:%M")
            }
          )
        )
      end

      it "returns unprocessable entity" do
        patch :update,
              params: { scheduling_rules: { start_time: "11:00", end_time: "18:00" } },
              format: :json

        expect(response).to have_http_status(:unprocessable_entity)
      end
    end

    context "when current user is not owner" do
      let(:non_owner) { create_user!(status: "user") }
      let!(:non_owner_diary) { create_diary!(user: non_owner) }

      before { sign_in(non_owner) }

      it "returns forbidden" do
        patch :update, params: { scheduling_rules: { start_time: "08:00" } }, format: :json

        expect(response).to have_http_status(:forbidden)
      end
    end

    context "when diary does not exist" do
      let(:owner_without_diary) { create_user!(status: "owner") }

      before { sign_in(owner_without_diary) }

      it "returns not found" do
        patch :update, params: { scheduling_rules: { start_time: "08:00" } }, format: :json

        expect(response).to have_http_status(:not_found)
      end
    end

    context "when unauthenticated" do
      it "returns unauthorized" do
        patch :update, params: { scheduling_rules: { start_time: "08:00" } }, format: :json

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "#create" do
    context "when authorized" do
      before do
        sign_in(owner)
        diary
      end

      it "creates a scheduling rule with defaults" do
        expect {
          post :create, format: :json
        }.to change(SchedulingRule, :count).by(1)

        expect(response).to have_http_status(:created)
        body = response.parsed_body
        expect(body["success"]).to eq(true)
        expect(body.dig("scheduling_rule", "session_duration_minutes")).to eq(60)
        expect(body.dig("scheduling_rule", "week_days")).to eq((0..6).to_a)
        expect(body.dig("scheduling_rule", "start_time")).to be_present
        expect(body.dig("scheduling_rule", "end_time")).to be_present
      end
    end
  end

  describe "#destroy" do
    let(:scheduling_rule) do
      create_scheduling_rule!(
        user: owner,
        diary: diary,
        overrides: {
          start_time: "07:00",
          end_time: "08:00",
          session_duration_minutes: 30,
          week_days: [ 1, 2 ]
        }
      )
    end

    before do
      sign_in(owner)
      scheduling_rule
    end

    it "resets the scheduling rule to defaults" do
      delete :destroy, format: :json

      expect(response).to have_http_status(:ok)
      scheduling_rule.reload
      expect(scheduling_rule.start_time.strftime("%H:%M")).to eq("09:00")
      expect(scheduling_rule.end_time.strftime("%H:%M")).to eq("19:00")
      expect(scheduling_rule.session_duration_minutes).to eq(60)
      expect(scheduling_rule.week_days).to eq((0..6).to_a)
    end
  end
end
