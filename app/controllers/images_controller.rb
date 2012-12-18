class ImagesController < ApplicationController
  def show
    file = params[:file]

    send_file File.join(Home::CONTENT_ROOT_DIRECTORY, file), :disposition => 'inline'
  end 
end
