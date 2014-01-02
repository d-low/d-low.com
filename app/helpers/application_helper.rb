module ApplicationHelper
  def number_to_ordinal number 
    I18n.with_locale(:en) { number.to_words ordinal: true }
  end
end
