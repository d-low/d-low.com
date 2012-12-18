require 'test_helper'
require 'home'
require 'image'

class ImageTest < ActiveSupport::TestCase
  test "Image Initialization" do
    image_file = '05-Colorado/07-Colorado-2012/04-Fall/04-Eldorado_Mountain-Nov_4_2012/2012-11-04-08-AfternoonLightInTheCanyon.JPG'
    image = Image.new(Home::CONTENT_ROOT_DIRECTORY + image_file)

    assert_not_nil(image.path, 'Image path is nil!')
    assert_equal(image.file_name, File.basename(image_file), 'Image file name does not match basename!')
    assert_not_nil(image.thumbnail, 'Image thumbnail is nil!')
    # TODO: Test that the date is a proper date/time object.
    assert_equal(image.caption, "Afternoon Light In The Canyon", 'Image caption is not correct.')
  end
end
