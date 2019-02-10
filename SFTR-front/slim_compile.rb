require 'slim'
Slim::Engine.set_options pretty: true, sort_attrs: false
puts Slim::Template.new(ARGV[0]).render

