require 'xcodeproj/project/object/helpers/groupable_helper'

module Xcodeproj
  class Project
    module Object
      # This class represents a reference to a file in the file system.
      #
      class PBXFileReference < AbstractObject
        # @!group Attributes

        # @return [String] the name of the reference, often not present.
        #
        attribute :name, String

        # @return [String] the path to the file relative to the source tree
        #
        attribute :path, String

        # @return [String] the directory to which the path is relative.
        #
        # @note   The accepted values are:
        #         - `<absolute>` for absolute paths
        #         - `<group>` for paths relative to the group
        #         - `SOURCE_ROOT` for paths relative to the project
        #         - `DEVELOPER_DIR` for paths relative to the developer
        #           directory.
        #         - `BUILT_PRODUCTS_DIR` for paths relative to the build
        #           products directory.
        #         - `SDKROOT` for paths relative to the SDK directory.
        #
        attribute :source_tree, String, 'SOURCE_ROOT'

        # @return [String] the file type (apparently) used for products
        #         generated by Xcode (i.e. applications, libraries).
        #
        attribute :explicit_file_type, String

        # @return [String] the file type guessed by Xcode.
        #
        # @note   This attribute is not present if there is an
        #         `explicit_file_type`.
        #
        attribute :last_known_file_type, String

        # @return [String] whether this file should be indexed. It can
        #         be either `0` or `1`.
        #
        # @note   Apparently present only for products generated by Xcode with
        #         a value of `0`.
        #
        attribute :include_in_index, String, '1'

        # @return [String] a string containing a number which represents the
        #         encoding format of the file.
        #
        attribute :fileEncoding, String

        # @return [String] a string that specifies the UTI for the syntax
        #         highlighting.
        #
        # @example
        #   `xcode.lang.ruby`
        #
        attribute :xc_language_specification_identifier, String

        # @return [String] a string that specifies the UTI for the structure of
        #         a plist file.
        #
        # @example
        #   `com.apple.xcode.plist.structure-definition.iphone.info-plist`
        #
        attribute :plist_structure_definition_identifier, String

        # @return [String] Whether Xcode should use tabs for text alignment.
        #
        # @example
        #   `1`
        #
        attribute :uses_tabs, String

        # @return [String] The width of the indent.
        #
        # @example
        #   `2`
        #
        attribute :indent_width, String

        # @return [String] The width of the tabs.
        #
        # @example
        #   `2`
        #
        attribute :tab_width, String

        # @return [String] Whether Xcode should wrap lines.
        #
        # @example
        #   `1`
        #
        attribute :wraps_lines, String

        # @return [String] Apparently whether Xcode should add, if needed, a
        #         new line feed before saving the file.
        #
        # @example
        #   `0`
        #
        attribute :line_ending, String

        # @return [String] a string that specifies the signature of an external
        #         framework.
        #
        # @example
        #   `AppleDeveloperProgram:TEAM0ID1:Team name`
        #
        attribute :expected_signature, String

        # @return [String] Comments associated with this file.
        #
        # @note   This is apparently no longer used by Xcode.
        #
        attribute :comments, String

        #---------------------------------------------------------------------#

        public

        # @!group Helpers

        # @return [String] the name of the file taking into account the path if
        #         needed.
        #
        def display_name
          if name
            name
          elsif (class << GroupableHelper; self; end)::SOURCE_TREES_BY_KEY[:built_products] == source_tree
            path
          elsif path
            File.basename(path)
          end
        end

        # @return [PBXGroup, PBXProject] the parent of the file.
        #
        def parent
          GroupableHelper.parent(self)
        end

        # @return [Array<PBXGroup, PBXProject>] The list of the parents of the
        #         reference.
        #
        def parents
          GroupableHelper.parents(self)
        end

        # @return [String] A representation of the reference hierarchy.
        #
        def hierarchy_path
          GroupableHelper.hierarchy_path(self)
        end

        # Moves the reference to a new parent.
        #
        # @param  [PBXGroup] new_parent
        #         The new parent.
        #
        # @return [void]
        #
        def move(new_parent)
          GroupableHelper.move(self, new_parent)
        end

        # @return [Pathname] the absolute path of the file resolving the
        # source tree.
        #
        def real_path
          GroupableHelper.real_path(self)
        end

        # @return [Pathname] the path of the file without resolving the
        # source tree.
        #
        def full_path
          GroupableHelper.full_path(self)
        end

        # Sets the source tree of the reference.
        #
        # @param  [Symbol, String] source_tree
        #         The source tree, either a string or a symbol.
        #
        # @return [void]
        #
        def set_source_tree(source_tree)
          GroupableHelper.set_source_tree(self, source_tree)
        end

        # Allows to set the path according to the source tree of the reference.
        #
        # @param  [#to_s] the path for the reference.
        #
        # @return [void]
        #
        def set_path(path)
          if path
            GroupableHelper.set_path_with_source_tree(self, path, source_tree)
          else
            self.path = nil
          end
        end

        # @return [Array<PBXBuildFile>] the build files associated with the
        #         current file reference.
        #
        def build_files
          referrers.grep(PBXBuildFile)
        end

        # Sets the last known file type according to the extension of the path.
        #
        # @return [void]
        #
        def set_last_known_file_type(type = nil)
          if type
            self.last_known_file_type = type
          elsif path
            extension = Pathname(path).extname[1..-1]
            self.last_known_file_type = Constants::FILE_TYPES_BY_EXTENSION[extension]
          end
        end

        # Sets the explicit file type according to the extension of the path,
        # and clears the last known file type.
        #
        # @return [void]
        #
        def set_explicit_file_type(type = nil)
          self.last_known_file_type = nil
          if type
            self.explicit_file_type = type
          elsif path
            extension = Pathname(path).extname[1..-1]
            self.explicit_file_type = Constants::FILE_TYPES_BY_EXTENSION[extension]
          end
        end

        #---------------------------------------------------------------------#

        # Checks whether the reference is a proxy.
        #
        # @return [Bool] always false for this ISA.
        #
        def proxy?
          false
        end

        # If this file reference represents an external Xcode project reference
        # then this will return metadata about it which includes the reference
        # to the 'Products' group that's created in this project (the project
        # that includes the external project).
        #
        # @return [ObjectDictionary, nil] The external project metadata for
        #         this file reference or `nil` if it's not an external project.
        #
        def project_reference_metadata
          project.root_object.project_references.find do |project_reference|
            project_reference[:project_ref] == self
          end
        end

        # If this file reference represents an external Xcode project reference
        # then this will return the objects that are 'containers' for items
        # contained in the external Xcode project.
        #
        # @return [Array<PBXContainerItemProxy>] The containers for items in
        #         the external Xcode project.
        #
        def proxy_containers
          project.objects.select do |object|
            object.isa == 'PBXContainerItemProxy' &&
              object.container_portal == uuid
          end
        end

        # If this file reference represents an external Xcode project reference
        # then this will return proxies for file references contained in the
        # external Xcode project.
        #
        # @return [Array<PBXReferenceProxy>] The file reference proxies for
        #         items located in the external Xcode project.
        #
        def file_reference_proxies
          containers = proxy_containers
          if containers.empty?
            []
          else
            project.objects.select do |object|
              object.isa == 'PBXReferenceProxy' &&
                containers.include?(object.remote_ref)
            end
          end
        end

        # If this file reference represents an external Xcode project reference
        # then this will return dependencies on targets contained in the
        # external Xcode project.
        #
        # @return [Array<PBXTargetDependency>] The dependencies on targets
        #         located in the external Xcode project.
        #
        def target_dependency_proxies
          containers = proxy_containers
          if containers.empty?
            []
          else
            project.objects.select do |object|
              object.isa == 'PBXTargetDependency' &&
                containers.include?(object.target_proxy)
            end
          end
        end

        # In addition to removing the file reference, this will also remove any
        # items related to this reference.
        #
        # @see AbstractObject#remove_from_project
        #
        # @return [void]
        #
        def remove_from_project
          if project_reference = project_reference_metadata
            file_reference_proxies.each(&:remove_from_project)
            target_dependency_proxies.each(&:remove_from_project)
            project_reference[:product_group].remove_from_project
            project.root_object.project_references.delete(project_reference)
          end

          build_files.each(&:remove_from_project)
          super
        end

        #---------------------------------------------------------------------#
      end
    end
  end
end
