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
    normalized_details = normalize_validation_details(details)
    normalized_message =
      if message == "Validation failed" && details.respond_to?(:full_messages)
        details.full_messages.to_sentence.presence || message
      else
        message
      end

    render_error(
      code: "validation_error",
      message: normalized_message,
      status: :unprocessable_entity,
      details: normalized_details
    )
  end

  def normalize_validation_details(details)
    return details.to_hash(true) if details.is_a?(ActiveModel::Errors)

    details
  end
end
