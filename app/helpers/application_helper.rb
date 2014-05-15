module ApplicationHelper
  def number_to_ordinal number 
    I18n.with_locale(:en) { number.to_words ordinal: true }
  end

  def javascript_anchor_href
    'javascript:void(0);'
  end

  def user_agent_class_name(user_agent) 
    ua = UserAgent.parse(user_agent)

    browser = ua.browser.parameterize
    version = browser + "-" + ua.version.to_s.parameterize
    ios = ua.ios? ? 'ios' : ''
    android = ua.android? ? 'android' : ''
   
    return [browser, version, ios, android].join(' ')
  end
end
