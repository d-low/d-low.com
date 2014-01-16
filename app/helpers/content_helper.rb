module ContentHelper
  def mobile_back_navigation(content)
    parent = content.get_parent_content

    html =  '<nav id="mobile-back-navigation">'

    if !parent.nil?
      html << "<a href=\"#{content_index_path(parent.path)}\">"
      html <<   "&lt; #{parent.page_title}"
      html << "</a>"
    else
      html << '<a href="/">&lt; Home</a>'
    end

    html << '</nav>'
  
    html.html_safe
  end
end
