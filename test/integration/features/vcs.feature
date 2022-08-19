Feature: VCS

  Scenario: Project that is not versioned
    Given the monorepo is lerna
    And a single packages directory is defined
    And the monorepo uses "npm" as the package manager
    And the dialect is "babel"
    And the package will not be tested or linted
    And nvm is properly configured
    When the project is scaffolded
    Then no error is thrown
    And the package will have no repository details defined

  Scenario: Project that is versioned
    Given the project is versioned on GitHub
    And a single packages directory is defined
    And the monorepo uses "npm" as the package manager
    And the dialect is "babel"
    And the monorepo is lerna
    And the package will not be tested or linted
    And nvm is properly configured
    When the project is scaffolded
    Then no error is thrown
    And the package will have repository details defined
