Feature: Lerna

  Scenario: Add Package
    Given the monorepo is lerna
    And a single packages directory is defined
    And the monorepo uses "npm" as the package manager
    And the dialect is "babel"
    And the package will be tested
    And nvm is properly configured
    When the project is scaffolded
    Then no error is thrown
    And the package is added to the monorepo
    And the project is configured as a package
    And project-level tools are not installed for the new package
    And a README is created for the new package

  Scenario: Add Config Package
    Given the monorepo is lerna
    And a single packages directory is defined
    And the monorepo uses "npm" as the package manager
    And the dialect is "common-js"
    And the package will not be tested or linted
    And nvm is properly configured
    When the project is scaffolded
    Then no error is thrown
    And the package is added to the monorepo
    And the project is configured as a config package
    And project-level tools are not installed for the new package
    And a README is created for the new package

  Scenario: Multiple Potential Target Directories
    Given the monorepo is lerna
    And multiple packages directories are defined
    And the monorepo uses "npm" as the package manager
    And the dialect is "common-js"
    And the package will not be tested or linted
    And nvm is properly configured
    When the project is scaffolded
    Then no error is thrown
    And the package is added to the monorepo
