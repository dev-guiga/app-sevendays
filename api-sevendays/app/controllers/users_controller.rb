class UsersController < ApplicationController
  # skip_before_action :verify_authenticity_token
  before_action :authenticate_user!, only: :show

  def create
    result = CreateUserService.new(user_params).call

    if result.success?
      @user = result.payload[:user]
      render :create, status: :created
    else
      render_validation_error(details: result.errors)
    end
  end

  def show
    @user = current_user
    render :show, status: :ok
  end

  private
  def user_params
    params.require(:user).permit(
      :first_name,
      :last_name,
      :username,
      :email,
      :password,
      :password_confirmation,
      :status,
      :cpf,
      :birth_date,
      address_attributes: [ :address, :city, :state, :neighborhood ]
    )
  end
end
