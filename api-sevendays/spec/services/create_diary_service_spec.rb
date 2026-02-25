require "rails_helper"

RSpec.describe CreateDiaryService, type: :service do
  subject(:result) do
    described_class.new(
      current_user: owner,
      diary_params: diary_params,
      scheduling_rule_params: scheduling_rule_params
    ).call
  end

  let(:owner) { create_user!(status: "owner") }
  let(:diary_params) { { title: "My Diary", description: "A long enough description." } }
  let(:scheduling_rule_params) do
    {
      start_time: "09:00",
      end_time: "10:00",
      session_duration_minutes: 60,
      week_days: [ 1, 3, 5 ],
      start_date: Date.current,
      end_date: Date.current + 7.days
    }
  end

  context "with valid params" do
    it "creates a diary and scheduling rule" do
      expect { result }.to change(Diary, :count).by(1)
        .and change(SchedulingRule, :count).by(1)

      expect(result).to be_success
      expect(result.payload[:diary]).to be_persisted
      expect(result.payload[:scheduling_rule]).to be_persisted
    end
  end

  context "with invalid params" do
    let(:diary_params) { { title: nil, description: "A long enough description." } }

    it "returns validation errors" do
      expect { result }.not_to change(Diary, :count)

      expect(result).not_to be_success
      expect(result.errors[:diary].to_hash).to include(:title)
    end
  end

  context "with missing scheduling rule fields" do
    let(:scheduling_rule_params) { {} }

    it "applies default scheduling rule values" do
      result

      rule = result.payload[:scheduling_rule]
      expect(rule.start_time.strftime("%H:%M")).to eq("09:00")
      expect(rule.end_time.strftime("%H:%M")).to eq("19:00")
      expect(rule.session_duration_minutes).to eq(60)
      expect(rule.week_days).to eq((0..6).to_a)
    end
  end
end
