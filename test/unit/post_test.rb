require 'test_helper'
require 'post'

class PostTest < ActiveSupport::TestCase
  test "Post Initialization" do
    post_file = '05-Colorado/07-Colorado-2012/04-Fall/04-Eldorado_Mountain-Nov_4_2012/'
    post = Post.new(post_file)

    assert_equal(post.title, 'Eldorado Mountain', 'Post title is not correct!')
    assert_equal(post.date, 'Nov 4, 2012', 'Post date is not correct!')
    assert_operator(post.images.length, :>, 0, 'Post contains no images!')
    assert_not_nil(post.last_updated, 'Post last updated is nil!')

    random_image = post.get_random_image

    assert_not_nil(random_image, 'Random image from post is nil!')
 end
end
