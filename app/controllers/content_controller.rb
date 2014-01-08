class ContentController < ApplicationController
  attr_reader :content
  
  def index
    @home_model = Home.new()
    @random_image = @home_model.newest_post.get_random_image
    @content = Content.new(params[:path])

    respond_to do |format|
      format.html # views/content/index.html.haml
    end
  end
end
