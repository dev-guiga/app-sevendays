class Scheduling < ApplicationRecord
  belongs_to :diary, inverse_of: :schedulings
  belongs_to :scheduling_rule, inverse_of: :schedulings
  belongs_to :user, inverse_of: :schedulings

  validates :diary_id, presence: true
  validates :scheduling_rule_id, presence: true
  validates :user_id, presence: true
  validates :date, presence: true
  validates :time, presence: true
  validates :session_duration_minutes, presence: true, numericality: { only_integer: true, greater_than: 0 }
  validates :description, presence: true, length: { minimum: 10, maximum: 1000 }
  validates :status, presence: true

  enum :status, { available: "available", marked: "marked", cancelled: "cancelled" }

  before_validation :sync_duration_from_rule, on: :create

  validate :time_at_least_next_hour
  validate :matches_scheduling_rule
  validate :does_not_overlap_existing

  scope :in_current_month, ->(date) {
    range = date.beginning_of_month..date.end_of_month
    where(date: range)
  }

  scope :between_dates_and_times, ->(date, start_time, end_time) {
    where(date: date).where(time: start_time..end_time)
  }

  private
    def scheduled_at
      return if date.blank? || time.blank?

      time_on_date(time)
    end

    def scheduled_end_at
      return if scheduled_at.blank? || session_duration_minutes.blank?

      scheduled_at + duration_in_seconds
    end

    def time_at_least_next_hour
      return if date.blank? || time.blank?

      lead_minutes = minimum_lead_minutes
      min_time = (Time.current + lead_minutes.minutes).beginning_of_minute
      return if scheduled_at && scheduled_at >= min_time

      errors.add(:time, "must be at least #{lead_minutes} minutes ahead")
    end

    def minimum_lead_minutes
      duration = session_duration_minutes
      duration ||= scheduling_rule&.effective_duration_minutes(at: scheduled_at || Time.current)
      return 60 if duration.blank?

      duration.between?(15, 45) ? 30 : 60
    end

    def matches_scheduling_rule
      return if scheduling_rule.blank? || date.blank? || time.blank?

      validate_date_within_rule
      validate_week_day
      validate_time_within_rule
      validate_time_alignment
    end

    def does_not_overlap_existing
      return if diary.blank? || date.blank? || time.blank?
      return if session_duration_minutes.blank?

      start_at = scheduled_at
      end_at = scheduled_end_at
      return if start_at.blank? || end_at.blank?

      scope = diary.schedulings.where(date: date)
      scope = scope.where.not(id: id) if persisted?

      scope.find_each do |other|
        next unless overlaps_with?(other, start_at, end_at)

        errors.add(:time, "overlaps existing scheduling")
        break
      end
    end

    def sync_duration_from_rule
      return if session_duration_minutes.present? || scheduling_rule.blank?

      effective_at = scheduled_at || Time.current
      self.session_duration_minutes = scheduling_rule.effective_duration_minutes(at: effective_at)
    end

    def time_on_date(clock_time)
      Time.zone.local(date.year, date.month, date.day, clock_time.hour, clock_time.min, clock_time.sec)
    end

    def duration_in_seconds
      session_duration_minutes.minutes
    end

    def validate_date_within_rule
      if scheduling_rule.start_date && date < scheduling_rule.start_date
        errors.add(:date, "is before scheduling rule start_date")
      end

      if scheduling_rule.end_date && date > scheduling_rule.end_date
        errors.add(:date, "is after scheduling rule end_date")
      end
    end

    def validate_week_day
      return if scheduling_rule.week_days.blank?

      errors.add(:date, "is not allowed by scheduling rule") unless scheduling_rule.week_days.include?(date.wday)
    end

    def validate_time_within_rule
      return if time_within_rule_range?

      start_seconds, end_seconds, time_seconds, duration_seconds = rule_time_data
      return if start_seconds.blank?

      if time_seconds < start_seconds || time_seconds + duration_seconds > end_seconds
        errors.add(:time, "is outside scheduling rule range")
      end
    end

    def validate_time_alignment
      return unless time_within_rule_range?

      start_seconds, _end_seconds, time_seconds, duration_seconds = rule_time_data
      return if start_seconds.blank?
      return if duration_seconds <= 0

      offset_seconds = time_seconds - start_seconds
      errors.add(:time, "does not align with scheduling rule duration") if (offset_seconds % duration_seconds).nonzero?
    end

    def rule_time_data
      return if scheduling_rule.start_time.blank? || scheduling_rule.end_time.blank? || session_duration_minutes.blank?

      [
        scheduling_rule.start_time.seconds_since_midnight,
        scheduling_rule.end_time.seconds_since_midnight,
        time.seconds_since_midnight,
        duration_in_seconds
      ]
    end

    def time_within_rule_range?
      start_seconds, end_seconds, time_seconds, duration_seconds = rule_time_data
      return true if start_seconds.blank?

      time_seconds >= start_seconds && (time_seconds + duration_seconds) <= end_seconds
    end

    def overlaps_with?(other, start_at, end_at)
      return false if other.time.blank?
      return false if other.cancelled?
      return false if other.session_duration_minutes.blank?

      other_start = time_on_date(other.time)
      other_end = other_start + other.session_duration_minutes.minutes

      start_at < other_end && end_at > other_start
    end
end
