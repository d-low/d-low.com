class HomeController < ApplicationController
  attr_reader :home_model

  def index
    @home_model = Home.new()

    respond_to do |format|
      format.html # views/home/index.html.haml
    end
  end
end
