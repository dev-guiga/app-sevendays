module Devise
  class SessionsController < DeviseController
    respond_to :json
    include ErrorRenderer

    prepend_before_action :require_no_authentication, only: :create
    prepend_before_action :allow_params_authentication!, only: :create

    def create
      self.resource = User.find_for_database_authentication(email: params_user[:email])

      if resource&.valid_password?(params_user[:password])
        sign_in(resource_name, resource)
        render json: { message: "Signed in successfully" }, status: :ok
      else
        render_error(
          code: "unauthorized",
          message: "Invalid email or password",
          status: :unauthorized,
          details: nil
        )
      end
    end

    def destroy
      sign_out(resource_name)
      head :no_content
    end

    protected

    def params_user
      params.require(:user).permit(:email, :password)
    end

    def auth_options
      { scope: resource_name, recall: "#{controller_path}#create", locale: I18n.locale }
    end
  end
end
