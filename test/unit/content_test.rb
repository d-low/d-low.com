require 'test_helper'
require 'content'

class ContentTest < ActiveSupport::TestCase
  test 'Content Initialization' do 
    content = Content.new('05-Colorado/07-Colorado-2012/04-Fall')

    assert_equal(content.title, 'Fall', 'Content title is not correct!')
    assert_equal(content.sub_content.length, 4, 'Content does not contain proper number of sub_content records!')
    assert_equal(content.posts.length, 0, 'Content does not contain proper number of posts!')
    assert_equal(content.are_sub_contents_posts?, true, 'Subcontents should be posts!')

    content2 = Content.new('05-Colorado')
    random_post = content2.get_random_post

    assert_not_nil(random_post, 'Random post from Content is nil!')
    assert_operator(random_post.images.length, :>, 0, 'Random post contains no images!')
    assert_not_nil(random_post.last_updated, 'Random post last updated is nil!')

    content3 = Content.new('05-Colorado/07-Colorado-2012/04-Fall/01-The_Flagstone_Path-Oct_14_2012')

    assert_equal(content3.title, 'The Flagstone Path, Oct 14 2012', 'Content title is not correct!')
    assert_equal(content3.sub_content.length, 0, 'Content does not contain proper number of sub_content records!')
    assert_equal(content3.posts.length, 01, 'Content does not contain proper number of posts!')
  end
end
