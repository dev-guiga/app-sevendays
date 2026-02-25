require "rails_helper"

RSpec.describe Owner::DiariesController, type: :controller do
  render_views

  let(:owner) { create_user!(status: "owner") }
  let(:user) { create_user!(status: "user") }
  let(:diary_params) { { title: "My Diary", description: "A long enough description." } }
  let(:scheduling_rule_params) {
    {
      start_time: "09:00",
      end_time: "10:00",
      session_duration_minutes: 60,
      week_days: [ 1, 3, 5 ],
      start_date: Date.current,
      end_date: Date.current + 7.days
    }
  }

  describe "routing" do
    it "routes POST /api/owner/diary to owner/diaries#create" do
      expect(post: "/api/owner/diary").to route_to("owner/diaries#create")
    end

    it "routes GET /api/owner/diary to owner/diaries#show" do
      expect(get: "/api/owner/diary").to route_to("owner/diaries#show")
    end

    it "routes PATCH /api/owner/diary to owner/diaries#update" do
      expect(patch: "/api/owner/diary").to route_to("owner/diaries#update")
    end
  end

  describe "#create" do
    context "when authorized" do
      before { sign_in(owner) }

      it "creates a diary and a scheduling rule" do
        expect {
          post :create, params: { diary: diary_params, scheduling_rules: scheduling_rule_params }, format: :json
        }.to change(Diary, :count).by(1).and change(SchedulingRule, :count).by(1)

        expect(response).to have_http_status(:created)
        body = response.parsed_body
        expect(body["success"]).to eq(true)
        expect(body.dig("diary", "title")).to eq(diary_params[:title])
        expect(body.dig("scheduling_rule", "week_days")).to eq(scheduling_rule_params[:week_days])
        expect(body.dig("scheduling_rule", "session_duration_minutes")).to eq(scheduling_rule_params[:session_duration_minutes])

        created_diary = Diary.last
        expect(created_diary.user_id).to eq(owner.id)
        expect(created_diary.scheduling_rule.user_id).to eq(owner.id)
      end
    end

    context "when user is not owner" do
      before { sign_in(user) }

      it "returns forbidden" do
        expect {
          post :create, params: { diary: diary_params, scheduling_rules: scheduling_rule_params }, format: :json
        }.not_to change(Diary, :count)

        expect(response).to have_http_status(:forbidden)
      end
    end

    context "when unauthenticated" do
      it "returns unauthorized" do
        post :create, params: { diary: diary_params, scheduling_rules: scheduling_rule_params }, format: :json
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "when invalid parameters" do
      before { sign_in(owner) }

      it "returns 422" do
        post :create, params: { diary: diary_params.merge(title: nil), scheduling_rules: scheduling_rule_params }, format: :json

        expect(response).to have_http_status(:unprocessable_entity)
        details = response.parsed_body.dig("error", "details", "diary")
        expect(details).to include("title")
      end
    end
  end

  describe "#update" do
    let!(:diary) { create_diary!(user: owner) }

    context "when authorized" do
      before { sign_in(owner) }

      it "updates the diary" do
        patch :update, params: { diary: { title: "Updated", description: "Updated description." } }, format: :json

        expect(response).to have_http_status(:ok)
        body = response.parsed_body
        expect(body["success"]).to eq(true)
        expect(body.dig("diary", "title")).to eq("Updated")
        expect(body.dig("diary", "description")).to eq("Updated description.")
      end
    end

    context "when diary does not exist" do
      let(:owner_without_diary) { create_user!(status: "owner") }

      before { sign_in(owner_without_diary) }

      it "returns not found" do
        patch :update, params: { diary: diary_params }, format: :json

        expect(response).to have_http_status(:not_found)
      end
    end

    context "when user is not owner" do
      let!(:user_diary) { create_diary!(user: user) }

      before { sign_in(user) }

      it "returns forbidden" do
        patch :update, params: { diary: diary_params }, format: :json

        expect(response).to have_http_status(:forbidden)
      end
    end

    context "when unauthenticated" do
      it "returns unauthorized" do
        patch :update, params: { diary: diary_params }, format: :json
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "when invalid parameters" do
      before { sign_in(owner) }

      it "returns 422" do
        patch :update, params: { diary: { title: nil } }, format: :json

        expect(response).to have_http_status(:unprocessable_entity)
        details = response.parsed_body.dig("error", "details", "diary")
        expect(details).to include("title")
      end
    end
  end

  describe "#show" do
    let(:diary) { create_diary!(user: owner) }
    let(:rule) { create_scheduling_rule!(user: owner, diary: diary) }
    let!(:scheduling) { Scheduling.create!(scheduling_attributes(user: user, diary: diary, rule: rule)) }

    context "when authorized" do
      before { sign_in(owner) }

      it "returns diary data with schedulings" do
        get :show, format: :json

        expect(response).to have_http_status(:ok)
        body = response.parsed_body
        expect(body["success"]).to eq(true)
        expect(body.dig("diary_data", "title")).to eq(diary.title)
        expect(body.dig("diary_data", "description")).to eq(diary.description)

        schedulings = body["schedulings"]
        expect(schedulings.size).to eq(1)
        expect(schedulings.first["user_name"]).to eq(user.full_name)
        expect(schedulings.first["date"]).to eq(scheduling.date.to_s)
        expect(schedulings.first["time"]).to be_present
        expect(schedulings.first["status"]).to eq(scheduling.status)
      end
    end

    context "when user is not owner" do
      let!(:user_diary) { create_diary!(user: user) }

      before { sign_in(user) }

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
end
