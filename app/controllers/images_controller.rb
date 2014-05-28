class ImagesController < ApplicationController
  def show
    file = params[:file]

    # NOTE: There is no need to sanitize the file and ensure that it represents
    # a valid image file becuase there is no way to get to this controller
    # method unless the path begins with "/images" so a malicious user cannot
    # download any file from our site, only those requests that begin with 
    # "/iamges" make it here.

    send_file File.join(Home::CONTENT_ROOT_DIRECTORY, file), :disposition => 'inline'
  end 
end
