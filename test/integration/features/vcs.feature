Feature: VCS

  Scenario: Project that is not versioned
    Given the monorepo is lerna
    And the package will not be tested or transpiled
    And nvm is properly configured
    When the project is scaffolded
    Then the package will have no repository details defined

  Scenario: Project that is versioned
    Given the project is versioned on GitHub
    And the monorepo is lerna
    And the package will not be tested or transpiled
    And nvm is properly configured
    When the project is scaffolded
    Then the package will have repository details defined
