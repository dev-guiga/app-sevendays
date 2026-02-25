class DiariesController < ApplicationController
  before_action :authenticate_user!
  before_action :set_diary, only: [ :show, :days ]
  def index
    return if performed?

    @diaries = Diary.all
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
  def set_diary
    @diary = Diary.find(params[:id])
  end

  def month_date
    month = params[:month].to_i
    month = Date.current.month if month < 1 || month > 12
    Date.new(Time.zone.today.year, month, 1)
  end
end
