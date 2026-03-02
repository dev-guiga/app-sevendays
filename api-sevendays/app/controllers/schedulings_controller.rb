class SchedulingsController < ApplicationController
  PER_PAGE = 20

  before_action :authenticate_user!
  before_action :ensure_non_owner!
  before_action :set_diary, except: [ :sidebar, :latest, :my_schedulings ]

  def index
    return if performed?

    @schedulings = @diary.schedulings
      .where(user_id: current_user.id)
      .order(date: :asc, time: :asc)

    render :index, status: :ok
  end

  def show
    return if performed?

    @scheduling = @diary.schedulings.find_by(id: params[:id], user_id: current_user.id)
    unless @scheduling
      render_error(code: "not_found", message: "Scheduling not found", status: :not_found, details: nil)
      return
    end

    render :show, status: :ok
  end

  def create
    return if performed?

    result = CreateUserSchedulingService.new(
      diary: @diary,
      user: current_user,
      params: scheduling_params
    ).call

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

  def update
    return if performed?

    result = UpdateUserSchedulingService.new(
      diary: @diary,
      scheduling_id: params[:id],
      user: current_user,
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

    result = CancelUserSchedulingService.new(
      diary: @diary,
      scheduling_id: params[:id],
      user: current_user
    ).call

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

    @schedulings = current_user.schedulings
      .includes(diary: :user)
      .active
      .marked
      .where(date: Time.zone.today)
      .order(time: :desc, created_at: :desc)
      .limit(10)

    render :sidebar, status: :ok
  end

  def latest
    return if performed?

    @schedulings = current_user.schedulings
      .includes(diary: :user)
      .active
      .marked
      .order(created_at: :desc, id: :desc)
      .limit(10)

    render :sidebar, status: :ok
  end

  def my_schedulings
    return if performed?

    page = pagination_page
    per_page = pagination_per_page

    schedulings_scope = filtered_user_schedulings_scope

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

    render :my_schedulings, status: :ok
  end

  private
  def pagination_page
    page = params[:page].to_i
    page.positive? ? page : 1
  end

  def pagination_per_page
    per_page = params[:per_page].to_i
    return PER_PAGE unless per_page.positive?

    [ per_page, 100 ].min
  end

  def filtered_user_schedulings_scope
    scope = current_user.schedulings
      .includes(diary: :user)
      .joins(diary: :user)

    scope = filter_by_user_query(scope)
    scope = filter_by_user_date_range(scope)
    scope = filter_by_user_status(scope)

    scope.order(created_at: created_at_order, id: created_at_order)
  end

  def filter_by_user_query(scope)
    query = params[:query].to_s.strip
    return scope if query.blank?

    search_term = "%#{ActiveRecord::Base.sanitize_sql_like(query)}%"
    scope.where(
      "diaries.title LIKE :term OR CONCAT(users.first_name, ' ', users.last_name) LIKE :term OR users.email LIKE :term",
      term: search_term
    )
  end

  def filter_by_user_date_range(scope)
    start_date = parse_date_param(params[:date_from])
    end_date = parse_date_param(params[:date_to])
    return scope if start_date.blank? && end_date.blank?

    return scope.where(date: [ start_date, end_date ].min..[ start_date, end_date ].max) if start_date && end_date
    return scope.where("schedulings.date >= ?", start_date) if start_date

    scope.where("schedulings.date <= ?", end_date)
  end

  def filter_by_user_status(scope)
    status = params[:status].to_s.strip.downcase
    return scope if status == "all"
    return scope.marked if status.blank?
    return scope.none unless Scheduling.statuses.key?(status)

    scope.where(status: status)
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
    params.require(:scheduling).permit(:date, :time, :description)
  end

  def set_diary
    @diary = Diary.find(params[:diary_id])
  end

  def ensure_non_owner!
    return unless current_user&.owner?

    render_error(code: "forbidden", message: "Forbidden", status: :forbidden, details: nil)
  end
end
