class Diary < ApplicationRecord
  belongs_to :user, inverse_of: :diary

  has_one :scheduling_rule, dependent: :destroy, inverse_of: :diary
  has_many :schedulings, dependent: :destroy, inverse_of: :diary

  validates :user_id, presence: true, uniqueness: true
  validates :title, presence: true
  validates :description, presence: true, length: { minimum: 10, maximum: 1000 }

  def available_slots_for(date)
    return [] if date.blank?

    rule = scheduling_rule
    return [] unless rule
    return [] unless date_within_rule?(rule, date)
    return [] if rule.week_days.present? && !rule.week_days.include?(date.wday)

    start_seconds = rule.start_time&.seconds_since_midnight
    end_seconds = rule.end_time&.seconds_since_midnight
    return [] if start_seconds.blank? || end_seconds.blank?
    return [] if start_seconds >= end_seconds

    booked = schedulings.where(date: date).where.not(status: "cancelled").to_a
    slots = []
    step_seconds = 15.minutes
    day_start = Time.zone.local(date.year, date.month, date.day)
    window_end = day_start + end_seconds
    now = Time.current

    (start_seconds...end_seconds).step(step_seconds) do |slot_seconds|
      slot_start = day_start + slot_seconds
      duration_minutes = rule.effective_duration_minutes(at: slot_start)
      next if duration_minutes.blank?

      duration_seconds = duration_minutes.minutes
      next if duration_seconds <= 0

      offset_seconds = slot_seconds - start_seconds
      next if (offset_seconds % duration_seconds).nonzero?

      slot_end = slot_start + duration_seconds
      next if slot_end > window_end
      next if slot_start < (now + minimum_lead_minutes(duration_minutes).minutes).beginning_of_minute
      next if overlaps_booked?(booked, slot_start, slot_end)

      slots << {
        start_time: slot_start.strftime("%H:%M"),
        end_time: slot_end.strftime("%H:%M")
      }
    end

    slots
  end

  private

  def date_within_rule?(rule, date)
    return false if rule.start_date && date < rule.start_date
    return false if rule.end_date && date > rule.end_date

    true
  end

  def minimum_lead_minutes(duration_minutes)
    return 60 if duration_minutes.blank?

    duration_minutes.between?(15, 45) ? 30 : 60
  end

  def overlaps_booked?(booked, slot_start, slot_end)
    booked.any? do |scheduling|
      next false if scheduling.time.blank? || scheduling.session_duration_minutes.blank?

      scheduled_at = Time.zone.local(
        scheduling.date.year,
        scheduling.date.month,
        scheduling.date.day,
        scheduling.time.hour,
        scheduling.time.min,
        scheduling.time.sec
      )
      scheduled_end = scheduled_at + scheduling.session_duration_minutes.minutes

      slot_start < scheduled_end && slot_end > scheduled_at
    end
  end
end
