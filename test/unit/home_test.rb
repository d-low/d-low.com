require 'test_helper'
require 'home'

class HomeTest < ActiveSupport::TestCase
  test 'Home Initialization' do 
    home = Home.new()

    assert_equal(home.contents.length, 5, 'Home contents is not proper length!')
    assert_not_nil(home.newest_post, 'Home newest postis nil!')
  end
end
