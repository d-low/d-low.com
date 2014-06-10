# This Ruby script will be run to parse the content of d-low.com and create a 
# hash wich will be converted to JSON in the format seen below.  This json file 
# will be used to bootstrap d-low.com by including a list of all the posts as an 
# inline script, or perhaps it will be requested via AJAX, since it is 158KB in 
# size with the path included in the post.
#
# "02-South_America": {
#    "01-February": {
#      "01-Navimag-Feb_12_2005": {
#        "name": "01-Navimag-Feb_12_2005",
#        "path": "./02-South_America/01-February/01-Navimag-Feb_12_2005",
#        "images": ["2005-02-08-1-AshleyAndVicki.JPG", ... , "2005-02-09-2-BingoMaster.JPG"],
#        "thumbnails": false
#      },
#      ...
#    ...
#  },
#  ...
#  "06-Europe": {
#    "01-Italy_and_Croatia": {
#      "01-Italy_Week_One": {
#        "01-Roma-May_28_2011": {
#          "name": "01-Roma-May_28_2011",
#          "path": "./06-Europe/01-Italy_and_Croatia/01-Italy_Week_One/01-Roma-May_28_2011",
#          "images": ["2011-05-28-01-IlColosseo.jpg", ... , "2011-05-29-06-TreviFountain.jpg"],
#          "thumbnails": true
#        }, 
#        ...
#      ...
#    ...
#  }
#
# TBD: The size *could* be reduced further if we omit the path and instead 
# construct it as we recurse to find each post, but then each post wouldn't be
# aware of where it is actually located.
    
require 'json'

def directory_hash(path, name=nil)
  data = {}

  # Get a list of all our posts by finding all index.html files found in the 
  # specified path.

  index_files = Dir.glob(path + '/**/index.html')

  # Iterate through all of our posts and for each one create a post hash and 
  # then add it to the data hash creating the appropriate parent keys if they 
  # do not already exist.

  index_files.each do |index_file| 
    post_path = File.dirname(index_file)
    post_path_parts = post_path.split('/') # TODO: Use file system specific separator

    post = nil
    post_name = File.basename(post_path)

    images = Dir.glob(post_path + '/*.*').
              select { |f| f =~ /\.jpg$/i }.
              map! { |f| File.basename(f) }

    thumbnails = Dir.glob(post_path + '/thumbnails/*.*').
              select { |f| f =~ /\.jpg$/i }.
              map! { |f| File.basename(f) }

    # Rather than duplicating the thumbnail names, which takes up many KB and
    # offers no real value, we just indicate whether thumbnails are present or
    # not by checking the length of the images and thumbnails arrays.  If 
    # they're the same, they'll be used to render the post preview.

    post_data = {
      :name => post_name,
      :path => post_path,
      # To remove duplicate information, we don't include index.html in the 
      # post. If there is a post, there is an index.html file.
      # :content => 'index.html', 
      :images => images,
      :thumbnails => images.length == thumbnails.length
    }

    # With the post data created now iterate through the post parts creating a
    # has for each parent directory that doesn't yet exist and then add the
    # post data when we've created all the parents.
    
    post_parent = data
    post_path_part_num = 0

    while post_path_part_num < post_path_parts.length - 1 do
      post_path_part = post_path_parts[post_path_part_num]

      if !post_parent.has_key?(post_path_part)
        post_parent[post_path_part] = {}
      end

      post_parent = post_parent[post_path_part]

      post_path_part_num = post_path_part_num + 1
    end

    post_parent[post_name] = post_data 
  end

  return data
end

content = directory_hash(ARGV[0])

# When invoked in the current directory the first key of the directory hash
# will be ".", so we remove that since we're intersted in the directories 
# themselves.
content = content[content.keys[0]]

# Output the JSON as a JavaScript variable for use on the client side.
puts "var content = #{content.to_json};"

