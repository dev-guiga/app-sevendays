class ApplicationController < ActionController::API
  include ActionController::Cookies
  include Devise::Controllers::Helpers
  include ErrorRenderer
  include Pundit::Authorization

  rescue_from ActiveRecord::RecordNotFound, with: :render_record_not_found
  rescue_from ActiveRecord::RecordInvalid, with: :render_record_invalid
  rescue_from ActionController::ParameterMissing, with: :render_parameter_missing
  rescue_from Pundit::NotAuthorizedError, with: :render_forbidden

  private
  def render_record_not_found(exception)
    details = {}
    details[:model] = exception.model if exception.respond_to?(:model)
    details[:id] = exception.id if exception.respond_to?(:id)
    details = nil if details.empty?

    render_error(
      code: "not_found",
      message: "Resource not found",
      status: :not_found,
      details: details
    )
  end

  def render_record_invalid(exception)
    render_validation_error(details: exception.record.errors)
  end

  def render_parameter_missing(exception)
    render_error(
      code: "bad_request",
      message: exception.message,
      status: :bad_request,
      details: { param: exception.param }
    )
  end

  def render_forbidden
    render_error(code: "forbidden", message: "Forbidden", status: :forbidden, details: nil)
  end
end
