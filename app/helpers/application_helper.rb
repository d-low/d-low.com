module ApplicationHelper
  def number_to_ordinal number 
    I18n.with_locale(:en) { number.to_words ordinal: true }
  end

  def javascript_anchor_href
    'javascript:void(0);'
  end
end
