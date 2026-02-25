require 'rails_helper'

RSpec.describe Scheduling, type: :model do
  def build_scheduling(overrides = {})
    user = create_user!
    diary = create_diary!(user: user)
    rule = create_scheduling_rule!(user: user, diary: diary)
    date = Date.current + 2.days
    scheduled_at = Time.zone.local(date.year, date.month, date.day, 10, 0, 0)

    Scheduling.new(
      {
        user: user,
        diary: diary,
        scheduling_rule: rule,
        date: scheduled_at.to_date,
        time: scheduled_at.strftime("%H:%M"),
        description: Faker::Lorem.characters(number: 20),
        status: :available
      }.merge(overrides)
    )
  end

  describe "validations" do
    it "is valid with required attributes" do
      expect(build_scheduling).to be_valid
    end

    it "is invalid without a diary" do
      expect(build_scheduling(diary: nil)).to be_invalid
    end

    it "is invalid without a scheduling_rule" do
      expect(build_scheduling(scheduling_rule: nil)).to be_invalid
    end

    it "is invalid without a user" do
      expect(build_scheduling(user: nil)).to be_invalid
    end

    it "is invalid without a date" do
      expect(build_scheduling(date: nil)).to be_invalid
    end

    it "is invalid without a time" do
      expect(build_scheduling(time: nil)).to be_invalid
    end

    it "is invalid without a description" do
      expect(build_scheduling(description: nil)).to be_invalid
    end

    it "is invalid with a short description" do
      expect(build_scheduling(description: "short")).to be_invalid
    end

    it "is invalid with an unsupported status" do
      scheduling = build_scheduling

      expect { scheduling.status = "invalid" }.to raise_error(ArgumentError, /'invalid' is not a valid status/)
    end

    it "is invalid when time does not align with session duration" do
      user = create_user!
      diary = create_diary!(user: user)
      date = Date.current + 3.days
      rule = create_scheduling_rule!(
        user: user,
        diary: diary,
        overrides: {
          start_time: "09:00",
          end_time: "12:00",
          session_duration_minutes: 60,
          start_date: date,
          end_date: date,
          week_days: [ date.wday ]
        }
      )

      scheduling = build_scheduling(
        user: user,
        diary: diary,
        scheduling_rule: rule,
        date: date,
        time: "09:30"
      )

      expect(scheduling).to be_invalid
      expect(scheduling.errors[:time]).to include("does not align with scheduling rule duration")
    end

    it "is invalid when scheduling exceeds the rule end_time" do
      user = create_user!
      diary = create_diary!(user: user)
      date = Date.current + 3.days
      rule = create_scheduling_rule!(
        user: user,
        diary: diary,
        overrides: {
          start_time: "09:00",
          end_time: "10:00",
          session_duration_minutes: 60,
          start_date: date,
          end_date: date,
          week_days: [ date.wday ]
        }
      )

      scheduling = build_scheduling(
        user: user,
        diary: diary,
        scheduling_rule: rule,
        date: date,
        time: "10:00"
      )

      expect(scheduling).to be_invalid
      expect(scheduling.errors[:time]).to include("is outside scheduling rule range")
    end

    it "is invalid when overlapping an existing scheduling" do
      user = create_user!
      diary = create_diary!(user: user)
      date = Date.current + 3.days
      rule = create_scheduling_rule!(
        user: user,
        diary: diary,
        overrides: {
          start_time: "09:00",
          end_time: "12:00",
          session_duration_minutes: 60,
          start_date: date,
          end_date: date,
          week_days: [ date.wday ]
        }
      )

      Scheduling.create!(
        scheduling_attributes(
          user: user,
          diary: diary,
          rule: rule,
          overrides: {
            date: date,
            time: "10:00"
          }
        )
      )

      overlapping = build_scheduling(
        user: user,
        diary: diary,
        scheduling_rule: rule,
        date: date,
        time: "10:00"
      )

      expect(overlapping).to be_invalid
      expect(overlapping.errors[:time]).to include("overlaps existing scheduling")
    end

    it "is valid when adjacent to an existing scheduling" do
      user = create_user!
      diary = create_diary!(user: user)
      date = Date.current + 3.days
      rule = create_scheduling_rule!(
        user: user,
        diary: diary,
        overrides: {
          start_time: "09:00",
          end_time: "12:00",
          session_duration_minutes: 60,
          start_date: date,
          end_date: date,
          week_days: [ date.wday ]
        }
      )

      Scheduling.create!(
        scheduling_attributes(
          user: user,
          diary: diary,
          rule: rule,
          overrides: {
            date: date,
            time: "10:00"
          }
        )
      )

      adjacent = build_scheduling(
        user: user,
        diary: diary,
        scheduling_rule: rule,
        date: date,
        time: "11:00"
      )

      expect(adjacent).to be_valid
    end

    it "is valid when overlapping a cancelled scheduling" do
      user = create_user!
      diary = create_diary!(user: user)
      date = Date.current + 3.days
      rule = create_scheduling_rule!(
        user: user,
        diary: diary,
        overrides: {
          start_time: "09:00",
          end_time: "12:00",
          session_duration_minutes: 60,
          start_date: date,
          end_date: date,
          week_days: [ date.wday ]
        }
      )

      Scheduling.create!(
        scheduling_attributes(
          user: user,
          diary: diary,
          rule: rule,
          overrides: {
            date: date,
            time: "10:00",
            status: "cancelled"
          }
        )
      )

      overlapping = build_scheduling(
        user: user,
        diary: diary,
        scheduling_rule: rule,
        date: date,
        time: "10:00"
      )

      expect(overlapping).to be_valid
    end
  end

  describe ".between_dates_and_times" do
    it "filters by date and time range" do
      user = create_user!
      diary = create_diary!(user: user)
      rule = create_scheduling_rule!(
        user: user,
        diary: diary,
        overrides: { start_time: "08:00", end_time: "20:00" }
      )
      date = Date.current + 1.day

      in_range = Scheduling.create!(
        scheduling_attributes(
          user: user,
          diary: diary,
          rule: rule,
          overrides: { date: date, time: "09:00" }
        )
      )
      Scheduling.create!(
        scheduling_attributes(
          user: user,
          diary: diary,
          rule: rule,
          overrides: { date: date, time: "19:00" }
        )
      )
      Scheduling.create!(
        scheduling_attributes(
          user: user,
          diary: diary,
          rule: rule,
          overrides: { date: date + 1.day, time: "09:00" }
        )
      )

      result = Scheduling.between_dates_and_times(date, "08:30", "12:00")

      expect(result).to contain_exactly(in_range)
    end
  end
end
