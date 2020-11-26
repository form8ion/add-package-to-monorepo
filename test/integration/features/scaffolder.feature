Feature: Lerna

  Scenario: Add Package
    Given the package will be tested
    And nvm is properly configured
    When the project is scaffolded
    Then the package is added to the monorepo
    And the project is configured as a package

  Scenario: Add Config Package
    Given the package will not be tested or transpiled
    And nvm is properly configured
    When the project is scaffolded
    Then the package is added to the monorepo
    And the project is configured as a config package
