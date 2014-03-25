# The Home model encapsulates the information needed for our home page including
# an array of Conent models and the newest post.  The content root directory is 
# also used frequently since the majority of our conrent is NOT saved in our rails
# application.
class Home
  CONTENT_ROOT_DIRECTORY = "#{Rails.root}/app/data/"
  CONTENT_ROOT_DIRECTORY_REGEXP = Regexp.new(CONTENT_ROOT_DIRECTORY, Regexp::IGNORECASE)
  
  attr_reader :contents
  attr_reader :newest_post

  def initialize
    get_contents
    get_most_recent_post
  end

  # Get a Content instance for each of one of our sub directories.
  def get_contents 
    @contents = []

    sub_directory_names = Dir[CONTENT_ROOT_DIRECTORY + "/*"]

    sub_directory_names.each do |sub_directory_name|
      sub_directory_basename = File.basename(sub_directory_name)
      @contents.push(Content.new(sub_directory_basename))
    end
  end

  # Get the most recent post by getting a list of the index.html files in all 
  # subdirectories, sorting them by the last modified date, reversing the 
  # order, and selecting the first (most recent).
  def get_most_recent_post
    newest_post = Dir[CONTENT_ROOT_DIRECTORY + "**/index.html"]
      .sort_by {|f| File.mtime(f)}
      .reverse[0]

    newest_post = File.dirname(newest_post)
    newest_post = newest_post.sub(CONTENT_ROOT_DIRECTORY, '')

    @newest_post = Post.new(newest_post)
  end

end
