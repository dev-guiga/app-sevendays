class Owner::SchedulingsController < ApplicationController
  PER_PAGE = 20

  before_action :authenticate_user!
  before_action :set_diary

  def index
    return if performed?

    authorize @diary, :schedule?
    page = pagination_page
    per_page = PER_PAGE

    schedulings_scope = @diary.schedulings
      .includes(:user)
      .marked
      .order(date: :desc, time: :desc, created_at: :desc)

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

  def scheduling_params
    params.require(:scheduling).permit(:user_email, :date, :time)
  end

  def set_diary
    @diary = current_user&.diary
    return if @diary

    render_error(code: "not_found", message: "Diary not found", status: :not_found, details: nil)
  end
end
