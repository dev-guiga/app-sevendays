class Owner::SchedulingsController < ApplicationController
  PER_PAGE = 20

  before_action :authenticate_user!
  before_action :set_diary

  def index
    return if performed?

    authorize @diary, :schedule?
    page = pagination_page
    per_page = PER_PAGE

    schedulings_scope = filtered_schedulings_scope

    total_count = schedulings_scope.count
    total_pages = (total_count.to_f / per_page).ceil
    total_pages = 1 if total_pages.zero?
    page = [ page, total_pages ].min

    @schedulings = schedulings_scope
      .offset((page - 1) * per_page)
      .limit(per_page)

    @pagination = {
      page: page,
      per_page: per_page,
      total_count: total_count,
      total_pages: total_pages,
      has_prev: page > 1,
      has_next: page < total_pages
    }

    render :index, status: :ok
  end

  def create
    return if performed?

    authorize @diary, :schedule?

    result = CreateOwnerSchedulingService.new(diary: @diary, params: scheduling_params).call

    if result.success?
      @scheduling = result.payload[:scheduling]
      @user = result.payload[:user]

      render :create, status: :created

    elsif result.errors.is_a?(String)
      render_error(code: result.status.to_s, message: result.errors, status: result.status, details: nil)
    else
      render_validation_error(details: result.errors)
    end
  end

  def days
    return if performed?

    authorize @diary, :schedule?

    @day = params[:date].present? ? Date.strptime(params[:date], "%Y-%m-%d") : Date.current
    @available_slots = @diary.available_slots_for(@day)

    render :days, status: :ok
  rescue ArgumentError
    render_error(code: "invalid_date", message: "Invalid date", status: :unprocessable_entity)
  end

  def update
    return if performed?

    authorize @diary, :schedule?

    result = UpdateOwnerSchedulingService.new(
      diary: @diary,
      scheduling_id: params[:id],
      params: scheduling_params
    ).call

    if result.success?
      @scheduling = result.payload[:scheduling]
      @user = result.payload[:user]
      render :update, status: :ok
    elsif result.errors.is_a?(String)
      render_error(code: result.status.to_s, message: result.errors, status: result.status, details: nil)
    else
      render_validation_error(details: result.errors)
    end
  end

  def destroy
    return if performed?

    authorize @diary, :schedule?

    result = CancelOwnerSchedulingService.new(diary: @diary, scheduling_id: params[:id]).call

    if result.success?
      @scheduling = result.payload[:scheduling]
      @user = result.payload[:user]
      render :destroy, status: :ok
    elsif result.errors.is_a?(String)
      render_error(code: result.status.to_s, message: result.errors, status: result.status, details: nil)
    else
      render_validation_error(details: result.errors)
    end
  end

  def sidebar
    return if performed?

    authorize @diary, :schedule?
    @schedulings = @diary.schedulings
      .includes(:user)
      .active
      .marked
      .where(date: Time.zone.today)
      .order(time: :desc, created_at: :desc)
      .limit(10)

    render :sidebar, status: :ok
  end

  private
  def pagination_page
    page = params[:page].to_i
    page.positive? ? page : 1
  end

  def filtered_schedulings_scope
    scope = @diary.schedulings
      .includes(:user)
      .joins(:user)

    scope = filter_by_query(scope)
    scope = filter_by_date_range(scope)
    scope = filter_by_name(scope)
    scope = filter_by_email(scope)
    scope = filter_by_date(scope)
    scope = filter_by_time(scope)
    scope = filter_by_status(scope)

    scope.order(created_at: created_at_order)
  end

  def filter_by_name(scope)
    name = params[:name].to_s.strip
    return scope if name.blank?

    search_term = "%#{ActiveRecord::Base.sanitize_sql_like(name)}%"
    scope.where("CONCAT(users.first_name, ' ', users.last_name) LIKE ?", search_term)
  end

  def filter_by_email(scope)
    email = params[:email].to_s.strip
    return scope if email.blank?

    search_term = "%#{ActiveRecord::Base.sanitize_sql_like(email)}%"
    scope.where("users.email LIKE ?", search_term)
  end

  def filter_by_query(scope)
    query = params[:query].to_s.strip
    return scope if query.blank?

    search_term = "%#{ActiveRecord::Base.sanitize_sql_like(query)}%"
    scope.where(
      "CONCAT(users.first_name, ' ', users.last_name) LIKE :term OR users.email LIKE :term",
      term: search_term
    )
  end

  def filter_by_date_range(scope)
    start_date = parse_date_param(params[:date_from])
    end_date = parse_date_param(params[:date_to])
    return scope if start_date.blank? && end_date.blank?

    return scope.where(date: [ start_date, end_date ].min..[ start_date, end_date ].max) if start_date && end_date
    return scope.where("schedulings.date >= ?", start_date) if start_date

    scope.where("schedulings.date <= ?", end_date)
  end

  def filter_by_date(scope)
    date = parsed_date_filter
    return scope if date.blank?

    scope.where(date: date)
  end

  def filter_by_time(scope)
    time = normalized_time_filter
    return scope if time.blank?

    scope.where("TIME_FORMAT(schedulings.time, '%H:%i') = ?", time)
  end

  def filter_by_status(scope)
    status = params[:status].to_s.strip.downcase
    return scope if status == "all"
    return scope.marked if status.blank?
    return scope.none unless Scheduling.statuses.key?(status)

    scope.where(status: status)
  end

  def parsed_date_filter
    parse_date_param(params[:date])
  end

  def normalized_time_filter
    raw_time = params[:time].to_s.strip
    return if raw_time.blank?

    return raw_time if raw_time.match?(/\A([01]\d|2[0-3]):[0-5]\d\z/)

    match = raw_time.match(/\A([01]\d|2[0-3]):([0-5]\d):([0-5]\d)\z/)
    "#{match[1]}:#{match[2]}" if match
  end

  def created_at_order
    raw_order =
      params[:created_at_order].presence ||
      params[:created_at].presence ||
      params[:create_at].presence ||
      params[:create_At].presence

    normalized_order = raw_order.to_s.strip.downcase
    return :asc if normalized_order == "asc"

    :desc
  end

  def parse_date_param(raw_value)
    value = raw_value.to_s.strip
    return if value.blank?
    return unless value.match?(/\A\d{4}-\d{2}-\d{2}\z/)

    Date.iso8601(value)
  rescue ArgumentError
    nil
  end

  def scheduling_params
    params.require(:scheduling).permit(:user_email, :date, :time)
  end

  def set_diary
    @diary = current_user&.diary
    return if @diary

    render_error(code: "not_found", message: "Diary not found", status: :not_found, details: nil)
  end
end
