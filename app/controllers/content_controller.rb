class ContentController < ApplicationController
  attr_reader :content
  
  def index
    path = params[:path]
    @content = Content.new(path)

    respond_to do |format|
      format.html # views/content/index.html.haml
    end
  end
end
