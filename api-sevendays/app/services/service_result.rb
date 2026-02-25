class ServiceResult
  attr_reader :payload, :errors, :status

  def initialize(success:, payload: nil, errors: nil, status: nil)
    @success = success
    @payload = payload
    @errors = errors
    @status = status
  end

  def success?
    @success
  end
end
