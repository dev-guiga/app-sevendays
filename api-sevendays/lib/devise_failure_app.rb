class DeviseFailureApp < Devise::FailureApp
  def respond
    if request.format.json?
      json_response
    else
      super
    end
  end

  private

  def json_response
    self.status = :unauthorized
    self.content_type = "application/json"
    self.response_body = {
      error: {
        code: "unauthorized",
        message: i18n_message,
        details: nil
      }
    }.to_json
  end
end
