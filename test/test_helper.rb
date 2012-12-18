ENV["RAILS_ENV"] = "test"
require File.expand_path('../../config/environment', __FILE__)

#
# rails/test_help has been commented out because our models do not inherit from
# ActiveRecord because there is no data base in our application, it is based off
# the file system.  So we followed the instructions in the following article to
# enable unit testing with out a database:
#
# http://media.pragprog.com/titles/fr_rr/NoDatabase.pdf
#

# require 'rails/test_help'
require File.expand_path('../../config/application', __FILE__)
require 'test/unit'
require 'active_support/test_case'
require 'action_controller/test_case'
require 'action_dispatch/testing/integration'

class ActiveSupport::TestCase
  # Setup all fixtures in test/fixtures/*.(yml|csv) for all tests in alphabetical order.
  #
  # Note: You'll currently still have to declare fixtures explicitly in integration tests
  # -- they do not yet inherit this setting
  # fixtures :all

  # Add more helper methods to be used by all tests here...
end
