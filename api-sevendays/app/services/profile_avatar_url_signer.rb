class ProfileAvatarUrlSigner
  DEFAULT_EXPIRES_IN = 10.minutes

  def initialize(user:, expires_in: DEFAULT_EXPIRES_IN)
    @user = user
    @expires_in = expires_in
  end

  def call
    return if user.blank? || user.avatar_storage_key.blank?
    return unless configured?

    presigner.presigned_url(
      :get_object,
      bucket: bucket,
      key: user.avatar_storage_key,
      expires_in: expires_in.to_i
    )
  rescue StandardError
    nil
  end

  private
  attr_reader :user, :expires_in

  def configured?
    bucket.present? &&
      region.present? &&
      endpoint.present? &&
      access_key_id.present? &&
      secret_access_key.present?
  end

  def presigner
    @presigner ||= Aws::S3::Presigner.new(client: s3_client)
  end

  def s3_client
    @s3_client ||= Aws::S3::Client.new(
      access_key_id: access_key_id,
      secret_access_key: secret_access_key,
      endpoint: endpoint,
      region: region,
      force_path_style: true
    )
  end

  def bucket
    ENV["MINIO_BUCKET"]
  end

  def region
    ENV.fetch("MINIO_REGION", "us-east-1")
  end

  def endpoint
    ENV["MINIO_PUBLIC_ENDPOINT"]
  end

  def access_key_id
    ENV["MINIO_ACCESS_KEY"]
  end

  def secret_access_key
    ENV["MINIO_SECRET_KEY"]
  end
end
