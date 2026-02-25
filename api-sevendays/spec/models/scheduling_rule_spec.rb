require 'rails_helper'

RSpec.describe SchedulingRule, type: :model do
  include ActiveSupport::Testing::TimeHelpers

  def build_rule(overrides = {})
    user = overrides.key?(:user) ? overrides.delete(:user) : create_user!
    diary =
      if overrides.key?(:diary)
        overrides.delete(:diary)
      elsif user
        create_diary!(user: user)
      else
        nil
      end

    SchedulingRule.new(
      {
        user: user,
        diary: diary,
        start_time: "09:00",
        end_time: "10:00",
        session_duration_minutes: 60,
        week_days: [ 1, 3, 5 ],
        start_date: Date.current,
        end_date: Date.current + 7.days
      }.merge(overrides)
    )
  end

  describe "validations" do
    it "is valid with required attributes" do
      expect(build_rule).to be_valid
    end

    it "is invalid without a user" do
      expect(build_rule(user: nil)).to be_invalid
    end

    it "is invalid without a diary" do
      expect(build_rule(diary: nil)).to be_invalid
    end

    it "is invalid without start_time" do
      expect(build_rule(start_time: nil)).to be_invalid
    end

    it "is invalid without end_time" do
      expect(build_rule(end_time: nil)).to be_invalid
    end

    it "is invalid without week_days" do
      expect(build_rule(week_days: nil)).to be_invalid
    end

    it "is invalid without session_duration_minutes" do
      expect(build_rule(session_duration_minutes: nil)).to be_invalid
    end

    it "is invalid when session_duration_minutes is not a multiple of 15" do
      rule = build_rule(session_duration_minutes: 10)
      expect(rule).to be_invalid
      expect(rule.errors[:session_duration_minutes]).to include("must be a multiple of 15 minutes")
    end

    it "is invalid when end_date is before start_date" do
      rule = build_rule(start_date: Date.current, end_date: Date.yesterday)
      expect(rule).to be_invalid
      expect(rule.errors[:end_date]).to include("must be equal or after start_date")
    end

    it "is invalid when end_time is not after start_time" do
      rule = build_rule(start_time: "10:00", end_time: "10:00")
      expect(rule).to be_invalid
      expect(rule.errors[:end_time]).to include("must be after start_time")
    end

    it "schedules a duration change to take effect after 1 day" do
      travel_to(Time.zone.local(2026, 1, 1, 10, 0, 0)) do
        owner = create_user!
        rule = create_scheduling_rule!(
          user: owner,
          diary: create_diary!(user: owner),
          overrides: { session_duration_minutes: 60 }
        )

        rule.update!(session_duration_minutes: 30)

        expect(rule.session_duration_minutes).to eq(60)
        expect(rule.session_duration_minutes_next).to eq(30)
        expect(rule.session_duration_effective_at).to eq(Time.current + 1.day)
      end
    end

    it "returns next duration after effective time" do
      now = Time.current
      rule = build_rule(
        session_duration_minutes: 60,
        session_duration_minutes_next: 30,
        session_duration_effective_at: now - 1.minute
      )

      expect(rule.effective_duration_minutes(at: now)).to eq(30)
    end
  end
end
