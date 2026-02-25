require "rails_helper"

RSpec.describe "Owner Diary", type: :request do
  describe "POST /api/owner/diary" do
    subject(:perform_request) { post "/api/owner/diary", params: params, as: :json }

    let(:owner) { create_user!(status: "owner") }
    let(:params) do
      {
        diary: {
          title: "My Diary",
          description: "A long enough description."
        },
        scheduling_rules: {
          start_time: "09:00",
          end_time: "10:00",
          session_duration_minutes: 60,
          week_days: [ 1, 3, 5 ],
          start_date: Date.current,
          end_date: Date.current + 7.days
        }
      }
    end

    context "when authenticated owner" do
      before { sign_in(owner) }

      it "creates the diary" do
        perform_request

        expect(response).to have_http_status(:created)
        expect(response.parsed_body["success"]).to eq(true)
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
