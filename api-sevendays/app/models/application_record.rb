class ApplicationRecord < ActiveRecord::Base
  primary_abstract_class

  # Keep development on primary by default. Enable replica reads only when a real
  # replication setup is available.
  connects_to database: { writing: :primary, reading: :replica } if Rails.env.development? && ENV["ENABLE_DB_REPLICA"] == "true"
end
