class Owner::UsersController < ApplicationController
  before_action :authenticate_user!

  def update
    unless current_user&.owner?
      render_error(code: "forbidden", message: "Forbidden", status: :forbidden, details: nil)
      return
    end

    if current_user.update(owner_user_params_with_address)
      @user = current_user
      render "users/show", status: :ok
    else
      render_validation_error(details: current_user.errors)
    end
  end

  private
  def owner_user_params
    params.require(:user).permit(
      :username,
      :email,
      :professional_description,
      :professional_document,
      :professional_branch,
      :address,
      :city,
      :state,
      :neighborhood,
      address_attributes: [ :address, :city, :state, :neighborhood ]
    )
  end

  def owner_user_params_with_address
    permitted = owner_user_params.to_h

    address_attributes =
      permitted["address_attributes"] ||
      permitted.slice("address", "city", "state", "neighborhood").compact_blank.presence

    permitted.except!("address", "city", "state", "neighborhood")

    if address_attributes.present? && current_user.address.present?
      address_attributes["id"] = current_user.address.id
    end

    if address_attributes.present?
      permitted["address_attributes"] = address_attributes
    end

    permitted
  end
end
