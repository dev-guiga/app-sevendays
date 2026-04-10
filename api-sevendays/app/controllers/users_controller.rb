class UsersController < ApplicationController
  # skip_before_action :verify_authenticity_token
  before_action :authenticate_user!, only: [ :show, :update, :avatar_presign ]

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

  def update
    if current_user.update(user_update_params)
      @user = current_user
      render :show, status: :ok
    else
      render_validation_error(details: current_user.errors)
    end
  end

  def avatar_presign
    result = ProfileAvatarUploadSigner.new(
      user: current_user,
      filename: avatar_presign_params[:filename],
      content_type: avatar_presign_params[:content_type],
      file_size: avatar_presign_params[:file_size]
    ).call

    if result.success?
      @avatar_upload = result.payload
      render :avatar_presign, status: :ok
    else
      render_validation_error(details: result.errors)
    end
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
      :avatar_storage_key,
      :cpf,
      :birth_date,
      :professional_description,
      :professional_document,
      :professional_branch,
      address_attributes: [ :address, :city, :state, :neighborhood ]
    )
  end

  def user_update_params
    params.require(:user).permit(:avatar_storage_key)
  end

  def avatar_presign_params
    params.permit(:filename, :content_type, :file_size)
  end
end
