module ErrorRenderer
  extend ActiveSupport::Concern

  private
  def render_error(code:, message:, status:, details: nil)
    payload = {
      error: {
        code: code.to_s,
        message: message,
        details: details
      }
    }

    render json: payload, status: status
  end

  def render_validation_error(details:, message: "Validation failed")
    render_error(
      code: "validation_error",
      message: message,
      status: :unprocessable_entity,
      details: details
    )
  end
end
