class SchedulingsController < ApplicationController
  before_action :authenticate_user!
  before_action :ensure_non_owner!
  before_action :set_diary

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

  private
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
