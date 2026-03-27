require 'json'
require_relative 'helpers'

class UserService
  def initialize(db)
    @db = db
  end

  def get_user(id)
    @db.find(id)
  end

  def list_users
    @db.all
  end
end

module Validators
  def self.validate_email(email)
    email.include?('@')
  end
end

def create_app(config)
  UserService.new(config[:db])
end
