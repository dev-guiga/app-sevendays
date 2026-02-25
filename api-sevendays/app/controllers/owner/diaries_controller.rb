class Owner::DiariesController < ApplicationController
  before_action :authenticate_user!
  before_action :set_diary, except: [ :create ]

  def create
    authorize Diary

    result = CreateDiaryService.new(
      current_user: current_user,
      diary_params: diary_params,
      scheduling_rule_params: scheduling_rule_params
    ).call

    if result.success?
      @diary = result.payload[:diary]
      @scheduling_rule = result.payload[:scheduling_rule]
      render :create, status: :created
    else
      render_validation_error(details: result.errors)
    end
  end

  def update
    return if performed?

    authorize @diary

    if @diary.update(diary_params)
      render :update, status: :ok
    else
      render_validation_error(details: { diary: @diary.errors })
    end
  end

  def show
    return if performed?

    authorize @diary
    @schedulings = @diary.schedulings.includes(scheduling_rule: :user)
    render :show, status: :ok
  end

  private
  def set_diary
    @diary = current_user&.diary

    return if @diary

    render_error(code: "not_found", message: "Diary not found", status: :not_found, details: nil)
    nil
  end

  def diary_params
    params.require(:diary).permit(:title, :description)
  end

  def scheduling_rule_params
    raw_params = params.fetch(:scheduling_rules, ActionController::Parameters.new)
    raw_params.permit(
      :start_time,
      :end_time,
      :start_date,
      :end_date,
      :session_duration_minutes,
      week_days: []
    )
  end
end
