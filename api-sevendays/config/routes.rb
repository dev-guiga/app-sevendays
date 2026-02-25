Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  scope path: "api" do
    resources :users, only: [ :create ]
    resource :user, only: [ :show ]

    devise_for :users, skip: [ :registrations ], controllers: {
      passwords: "devise/passwords",
      sessions: "devise/sessions"
    }

    namespace :owner do
      resource :diary, only: [ :create, :show, :update ], controller: "diaries" do
        resources :schedulings, only: [ :index, :create, :update, :destroy ]
        resource :scheduling_rule, only: [ :show, :create, :update, :destroy ], controller: "scheduling_rules"
      end
    end

    resources :diaries, only: [ :index, :show ] do
      get :days, on: :member
      resources :schedulings, only: [ :index, :show, :create, :update, :destroy ] do
        get :days, on: :member
      end
    end
  end
end
