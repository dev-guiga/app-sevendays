module Devise
class Devise::PasswordsController < DeviseController
  respond_to :json
  include ErrorRenderer

  def create
    self.resource = resource_class.send_reset_password_instructions(resource_params)
    yield resource if block_given?

    if successfully_sent?(resource)
      render json: { message: "Email sent with instructions to reset password" }, status: :ok
    else
      render_validation_error(details: resource.errors)
    end
  end

  def update
    self.resource = resource_class.reset_password_by_token(resource_params)
    yield resource if block_given?

    if resource.errors.empty?
      resource.unlock_access! if unlockable?(resource)
      render json: { message: "Password reset successfully" }, status: :ok
    else
      set_minimum_password_length
      render_validation_error(details: resource.errors)
    end
  end

  protected


  def unlockable?(resource)
    resource.respond_to?(:unlock_access!) &&
      resource.respond_to?(:unlock_strategy_enabled?) &&
      resource.unlock_strategy_enabled?(:email)
  end

  def translation_scope
    "devise.passwords"
  end
end
end
