class ProfileAvatarUploadSigner
  include ActiveModel::Model

  ALLOWED_CONTENT_TYPES = %w[
    image/jpeg
    image/png
    image/webp
  ].freeze
  DEFAULT_EXPIRES_IN = 10.minutes
  MAX_FILE_SIZE_BYTES = 5.megabytes

  validate :validate_user
  validate :validate_storage_configuration
  validate :validate_content_type
  validate :validate_file_size

  def initialize(user:, filename:, content_type:, file_size:, expires_in: DEFAULT_EXPIRES_IN)
    super()
    @user = user
    @filename = filename.to_s
    @content_type = content_type.to_s
    @file_size = file_size.to_i
    @expires_in = expires_in
  end

  def call
    return ServiceResult.new(success: false, errors: errors, status: :unprocessable_entity) unless valid?

    ServiceResult.new(
      success: true,
      payload: {
        upload_url: presigner.presigned_url(
        :put_object,
        bucket: bucket,
        key: object_key,
        expires_in: expires_in.to_i,
        content_type: content_type
        ),
        avatar_storage_key: object_key,
        content_type: content_type
      },
      status: :ok
    )
  rescue StandardError => e
    errors.add(:base, e.message.presence || "Nao foi possivel gerar a URL de upload do avatar.")
    ServiceResult.new(success: false, errors: errors, status: :unprocessable_entity)
  end

  private
  attr_reader :user, :filename, :content_type, :file_size, :expires_in

  def validate_user
    errors.add(:user, "invalido") if user.blank? || user.id.blank?
  end

  def validate_storage_configuration
    return if configured?

    errors.add(:base, "Configuracao de storage invalida.")
  end

  def validate_content_type
    return if ALLOWED_CONTENT_TYPES.include?(content_type)

    errors.add(:content_type, "deve ser JPG, PNG ou WEBP")
  end

  def validate_file_size
    if file_size <= 0
      errors.add(:file_size, "deve ser maior que zero")
      return
    end

    if file_size > MAX_FILE_SIZE_BYTES
      errors.add(:file_size, "deve ter no maximo 5 MB")
    end
  end

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

  def object_key
    @object_key ||= "avatars/users/#{user.id}/#{SecureRandom.uuid}#{normalized_extension}"
  end

  def normalized_extension
    extension = File.extname(filename).downcase
    return extension if extension.present?

    case content_type
    when "image/jpeg"
      ".jpg"
    when "image/png"
      ".png"
    when "image/webp"
      ".webp"
    else
      ""
    end
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
