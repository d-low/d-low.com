require 'time'

# The Image model encapsulates all the information about an image in one of our posts including
# the image path, relative path, the thumbnail path, the relative thumbnail path as well as the
# file name, date and a caption parsed from the file name.
class Image
  attr_reader :path
  attr_reader :relative_path
  attr_reader :file_name
  attr_reader :thumbnail
  attr_reader :relative_thumbnail_path
  attr_reader :date
  attr_reader :caption

  def initialize(path)
    @path = path
    @relative_path = @path.sub(Home::CONTENT_ROOT_DIRECTORY, '')
    @file_name = File.basename(@path)
    
    set_thumbnail
    set_date
    set_caption
  end

  # Set the thumbnail if a thumbnails directory exists and contains a file 
  # with the same file name. Otherwise simply use the large image as the 
  # thumbnail.
  def set_thumbnail
     dir_name = File.dirname(@path)

    if File.exists?(dir_name + '/thumbnails/' + @file_name)
      @thumbnail = dir_name + '/thumbnails/' + @file_name
      @relative_thumbnail_path = @thumbnail.sub(Home::CONTENT_ROOT_DIRECTORY, '')
    else
      @thumbnail = @path
      @relative_thumbnail_path = @relative_path
    end
  end

  def set_date
    file_name_parts = @file_name.split('-')

    @date = Time.parse(file_name_parts[0] + '-'+ file_name_parts[1] + '-' + 
      file_name_parts[2] + 'T00:00:00Z')
  end

  # Set the caption by removing the date part of the file name, then removing
  # the extension, and then inserting a white space between each upper and 
  # lower case character. 
  def set_caption
    @caption = @file_name.split('-')[-1]
      .sub(/.jpg/i, '')
      .gsub(/([a-z])([A-Z])/, '\1 \2')
  end
end
