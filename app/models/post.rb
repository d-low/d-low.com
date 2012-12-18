# The Post model encapsulates all the information about a post including the path to it, its 
# title, the date of the post, an array of the images found in it, the content, and the date
# if was last updated.
class Post
	attr_reader :path
	attr_reader :title
	attr_reader :date
	attr_reader :images
	attr_reader :content
	attr_reader :last_updated

	def initialize(path)
		@path = path
		@absolute_path = Home::CONTENT_ROOT_DIRECTORY + @path

		# TODO: Add validators for path, thumbnails, images, content, and last_updated members.
		
		set_title_and_date
		set_content
		set_images
		set_lastupdate
	end

	# The post title and date are part of the base name.  For example, for
	# 04-Eldorado_Mountain-Nov_4_2012 the title is "Eldorado Mountain" and 
	# the date is "Nov 4, 2012".
	def set_title_and_date
		title_and_date_parts = File.basename(@path).split('-')
		
		@title = title_and_date_parts[1].gsub(/_/, ' ')
		@date = title_and_date_parts[2].sub(/_/, ' ').sub(/_/, ', ')
	end

	# The content of a post is the contents of the index.html file.
	def set_content
		f = File.open(@absolute_path + "/index.html")
		lines = f.readlines
		@content = lines.join("")
	end

	# Create image model instances for each JPG file found in our post path.
	def set_images
		@images = []
		image_files = Dir[@absolute_path + "/*.jpg"]

		image_files.each do |image_file|
			@images.push(Image.new(image_file))
		end
	end

	def set_lastupdate
		@last_updated =  File.stat(@absolute_path).atime
	end

	# Return a random image from our images array if there are images for this 
	# post.  There are one or two posts which do not have images.
	def get_random_image
		if @images.length > 0
			r = Random.new
			random_image = r.rand(0..(@images.length - 1))
			@images[random_image]
		end
	end
end
