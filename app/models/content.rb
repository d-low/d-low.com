# The Content model encapsulates the information needed for a content item on
# the site.  The content item may be a directory with sub-directories or a 
# post.
class Content
  attr_reader :root
  attr_reader :path
  attr_reader :parent_path
  attr_reader :absolute_path
  attr_reader :title
  attr_reader :page_title
  attr_reader :posts
  attr_reader :is_post

  def initialize(path)
    @root = Home::CONTENT_ROOT_DIRECTORY
    @path = path
    @parent_path = @path.sub(File.basename(@path), '')
    @absolute_path = @root + @path
    @title = ''
    @sub_content = []
    @posts = []
    @is_post = false

    # Ensure the absolute path ends with a slash.
    if (@absolute_path =~ /\/$/) == nil
      @absolute_path += '/'
    end

    # Test that the path exists, if it doesn't we will throw an error, for now.
    if File.directory?(@absolute_path) == false
      raise ArgumentError, "Content does not exist: #{ @path }!"
    end

    set_title
    set_page_title
    
    if File.exists?(@absolute_path + 'index.html')
      @is_post = true
    end
  end

  # Set the title, removing leading numbers, and then coverting underscores to 
  # white spaces and dashes to commas.  e.g. 07-Colorado-2012 -> Colorado, 2012.
  def set_title
    @title = File.basename(@absolute_path)
    @title.sub!(/^[0-9][0-9]-/, '')
    @title.gsub!(/_/, ' ')
    @title.gsub!(/-/, ', ')
  end

  # Include the parent page title in our page title if our page title is a
  # season.  e.g. 'Fall' -> Fall Colorado, 2012.
  # REVIEW: Do we need a separate method for this?  Or should we have better 
  # titles to begin with?
  def set_page_title
    case @title
      when 'Winter', 'Spring', 'Summer', 'Fall'
        parent_content = Content.new(@parent_path)
        @page_title = @title + ' ' + parent_content.title
      else
        @page_title = @title
    end
  end

  # If the Content is not a post then get a list of our subdirectories and 
  # instantiate a Content model instance for each.  Then call each instance's
  # set_posts method which will instantiate a list of post models for each post
  # found in the subdirectory.  Returning the array of sub Content models.
  def sub_content 
    sub_contents = []

    if @is_post == false
      sub_directories = Dir.glob(@absolute_path + '*');

      sub_directories.each do |sub_directory|
        begin
          # Remove the root from the path we pass to the new Content instance.
          # REVIEW: Should we be flexible and allow for the root dir to be present?
          content = Content.new(sub_directory.sub(@root, ''))
          sub_contents.push(content)
        rescue ArgumentError
          next
        end
      end
    end

    sub_contents
  end

  def get_post
    if @is_post
      Post.new(@path)
    end
  end
  
  # If this Content model instance is a post then return it, otherwise using 
  # directory globbing, find all index.html files in our sub directories, 
  # select one at random, and return a Post model instance for it.
  def get_random_post
    if @is_post
      Post.new(@path)
    else
      r = Random.new
      post_paths = Dir.glob(@absolute_path + '**/index.html')
      random_post_num = r.rand(0..(post_paths.length - 1))
      random_post_path = post_paths[random_post_num]
      # Remove the the index.html from the path and then then remove the root path.
      Post.new(File.dirname(random_post_path).sub(Home::CONTENT_ROOT_DIRECTORY, ''))
    end
  end

  # Get a list of sub directories and check to see if they all have an 
  # index.html file, if so then they're all posts!
  def are_sub_contents_posts?
    ret_val = true

    if @is_post
      ret_val = false
    else
      sub_directories = Dir.glob(@absolute_path + '*');

      sub_directories.each do |sub_directory|
        if File.exists?(sub_directory + '/index.html') == false
          ret_val = false
          break  
        end
      end
    end

    ret_val
  end

end
