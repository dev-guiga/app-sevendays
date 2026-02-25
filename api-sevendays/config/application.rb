require_relative "boot"
require "rails/all"

Bundler.require(*Rails.groups)

module ApiSevendays
  class Application < Rails::Application
    config.load_defaults 8.1
    config.autoload_lib(ignore: %w[assets tasks])
    config.api_only = true
    config.session_store :cookie_store, key: "_api_sevendays_session"
    config.middleware.insert_before Warden::Manager, ActionDispatch::Cookies
    config.middleware.insert_before Warden::Manager, ActionDispatch::Session::CookieStore, key: "_api_sevendays_session"
  end
end
