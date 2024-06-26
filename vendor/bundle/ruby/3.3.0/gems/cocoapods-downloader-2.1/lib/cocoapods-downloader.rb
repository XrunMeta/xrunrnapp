module Pod
  module Downloader
    require 'cocoapods-downloader/gem_version'
    require 'cocoapods-downloader/api'
    require 'cocoapods-downloader/api_exposable'
    require 'cocoapods-downloader/base'

    autoload :Git,         'cocoapods-downloader/git'
    autoload :Http,        'cocoapods-downloader/http'
    autoload :Mercurial,   'cocoapods-downloader/mercurial'
    autoload :Scp,         'cocoapods-downloader/scp'
    autoload :Subversion,  'cocoapods-downloader/subversion'

    # Denotes the error generated by a Downloader
    #
    class DownloaderError < StandardError; end

    # @return [Hash{Symbol=>Class}] The concrete classes of the supported
    #         strategies by key.
    #
    def self.downloader_class_by_key
      {
        :git  => Git,
        :hg   => Mercurial,
        :http => Http,
        :scp  => Scp,
        :svn  => Subversion,
      }
    end

    # Identifies the concrete strategy for the given options.
    #
    # @param  [Hash{Symbol}] options
    #         The options for which a strategy is needed.
    #
    # @return [Symbol] The symbol associated with a concrete strategy.
    # @return [Nil] If no suitable concrete strategy could be selected.
    #
    def self.strategy_from_options(options)
      common = downloader_class_by_key.keys & options.keys
      if common.count == 1
        common.first
      end
    end

    # @return [Downloader::Base] A concrete downloader according to the
    #         options.
    #
    def self.for_target(target_path, options)
      options = options_to_sym(options)

      if target_path.nil?
        raise DownloaderError, 'No target path provided.'
      end

      strategy, klass = class_for_options(options)

      url = options[strategy]
      sub_options = options.dup
      sub_options.delete(strategy)

      klass.new(target_path, url, sub_options)
    end

    # Have the concrete strategy preprocess options
    #
    # @param [Hash<Symbol,String>] options
    #        The request options to preprocess
    #
    # @return [Hash<Symbol,String>] the new options
    #
    def self.preprocess_options(options)
      options = options_to_sym(options)

      _, klass = class_for_options(options)
      klass.preprocess_options(options)
    end

    private_class_method

    def self.options_to_sym(options)
      Hash[options.map { |k, v| [k.to_sym, v] }]
    end

    def self.class_for_options(options)
      if options.nil? || options.empty?
        raise DownloaderError, 'No source URL provided.'
      end

      strategy = strategy_from_options(options)
      unless strategy
        raise DownloaderError, 'Unsupported download strategy ' \
          "`#{options.inspect}`."
      end

      # Explicit return for multiple params, rubocop thinks it's useless but it's not
      return strategy, downloader_class_by_key[strategy] # rubocop:disable Style/RedundantReturn
    end
  end
end
