require "faker"

module DataHelpers
  def address_attributes(overrides = {})
    {
      address: Faker::Address.street_address,
      city: Faker::Address.city,
      state: Faker::Address.state_abbr,
      neighborhood: Faker::Address.community
    }.merge(overrides)
  end

  def user_attributes(overrides = {}, address_overrides = {})
    {
      first_name: Faker::Name.first_name,
      last_name: Faker::Name.last_name,
      username: Faker::Internet.unique.username(specifier: 6)[0, 20],
      email: Faker::Internet.unique.email,
      password: "password123",
      password_confirmation: "password123",
      cpf: Faker::Number.unique.number(digits: 11).to_s,
      birth_date: Faker::Date.birthday(min_age: 18, max_age: 65),
      status: "user",
      address_attributes: address_attributes(address_overrides)
    }.merge(overrides)
  end

  def create_user!(overrides = {}, address_overrides = {})
    User.create!(user_attributes(overrides, address_overrides))
  end

  def diary_attributes(user: create_user!, overrides: {})
    {
      user: user,
      title: Faker::Book.title,
      description: Faker::Lorem.characters(number: 30)
    }.merge(overrides)
  end

  def create_diary!(user: create_user!, overrides: {})
    Diary.create!(diary_attributes(user: user, overrides: overrides))
  end

  def scheduling_rule_attributes(user:, diary:, overrides: {})
    {
      user: user,
      diary: diary,
      start_time: "00:00",
      end_time: "23:59",
      session_duration_minutes: 60,
      week_days: (0..6).to_a,
      start_date: Date.current - 1.day,
      end_date: Date.current + 30.days
    }.merge(overrides)
  end

  def create_scheduling_rule!(user: create_user!, diary: create_diary!(user: user), overrides: {})
    SchedulingRule.create!(scheduling_rule_attributes(user: user, diary: diary, overrides: overrides))
  end

  def scheduling_attributes(user: create_user!, diary: create_diary!(user: user), rule: create_scheduling_rule!(user: user, diary: diary), overrides: {})
    scheduled_at = next_slot_for(rule, from_time: Time.current + 1.hour)
    {
      user: user,
      diary: diary,
      scheduling_rule: rule,
      date: scheduled_at.to_date,
      time: scheduled_at.strftime("%H:%M"),
      description: Faker::Lorem.characters(number: 30),
      status: "available",
      created_at: Time.current,
      updated_at: Time.current
    }.merge(overrides)
  end

  def build_user(overrides = {}, address_overrides = {})
    User.new(user_attributes(overrides, address_overrides))
  end

  def build_diary(overrides = {})
    attrs = diary_attributes(**extract_diary_params(overrides))
    Diary.new(attrs)
  end

  def build_scheduling_rule(overrides = {})
    attrs = scheduling_rule_attributes(**extract_rule_params(overrides))
    SchedulingRule.new(attrs)
  end

  def build_scheduling(overrides = {})
    attrs = scheduling_attributes(**extract_sched_params(overrides))
    Scheduling.new(attrs)
  end

  private

  # Helpers to unpack optional keys without mutating caller hashes
  def extract_diary_params(overrides)
    user = overrides.key?(:user) ? overrides[:user] : create_user!
    { user: user, overrides: overrides.except(:user) }
  end

  def extract_rule_params(overrides)
    user_present = overrides.key?(:user)
    user = user_present ? overrides[:user] : create_user!

    diary =
      if overrides.key?(:diary)
        overrides[:diary]
      elsif user
        create_diary!(user: user)
      else
        nil
      end

    { user: user, diary: diary, overrides: overrides.except(:user, :diary) }
  end

  def extract_sched_params(overrides)
    user = overrides.delete(:user) || create_user!
    diary = overrides.delete(:diary) || create_diary!(user: user)
    rule = overrides.delete(:scheduling_rule) || create_scheduling_rule!(user: user, diary: diary)
    { user: user, diary: diary, rule: rule, overrides: overrides }
  end

  def next_slot_for(rule, from_time:)
    return from_time.beginning_of_hour unless rule&.start_time && rule&.end_time

    duration_minutes =
      if rule.respond_to?(:effective_duration_minutes)
        rule.effective_duration_minutes(at: from_time)
      else
        rule.session_duration_minutes
      end

    return from_time.beginning_of_hour if duration_minutes.blank?

    duration_seconds = duration_minutes.minutes
    date = from_time.to_date
    start_seconds = rule.start_time.seconds_since_midnight
    end_seconds = rule.end_time.seconds_since_midnight
    time_seconds = from_time.seconds_since_midnight

    if time_seconds < start_seconds
      slot_seconds = start_seconds
    else
      offset_seconds = time_seconds - start_seconds
      slots = (offset_seconds.to_f / duration_seconds).ceil
      slot_seconds = start_seconds + (slots * duration_seconds)
    end

    if slot_seconds + duration_seconds > end_seconds
      date += 1.day
      slot_seconds = start_seconds
    end

    Time.zone.local(date.year, date.month, date.day) + slot_seconds
  end
end
