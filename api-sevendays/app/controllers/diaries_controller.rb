class DiariesController < ApplicationController
  PER_PAGE = 12

  before_action :authenticate_user!
  before_action :set_diary, only: [ :show, :days ]

  def index
    return if performed?

    page = pagination_page
    per_page = PER_PAGE

    diaries_scope = Diary.includes(user: :address).order(created_at: :desc)

    total_count = diaries_scope.count
    total_pages = (total_count.to_f / per_page).ceil
    total_pages = 1 if total_pages.zero?
    page = [ page, total_pages ].min

    @diaries = diaries_scope.offset((page - 1) * per_page).limit(per_page)

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

  def show
    return if performed?

    @schedulings = @diary.schedulings.includes(:user).in_current_month(month_date)
    render :show, status: :ok
  rescue ArgumentError
    render_error(code: "invalid_date_format", message: "Invalid date format", status: :unprocessable_entity)
  end

  def days
    return if performed?

    @day = params[:date].present? ? Date.strptime(params[:date], "%Y-%m-%d") : Date.current
    @available_slots = @diary.available_slots_for(@day)

    render :days, status: :ok
  rescue ArgumentError
    render_error(code: "invalid_date", message: "Invalid date", status: :unprocessable_entity)
  end

  private
  def pagination_page
    page = params[:page].to_i
    page.positive? ? page : 1
  end

  def set_diary
    @diary = Diary.includes(user: :address).find(params[:id])
  end

  def month_date
    month = params[:month].to_i
    month = Date.current.month if month < 1 || month > 12
    Date.new(Time.zone.today.year, month, 1)
  end
end
