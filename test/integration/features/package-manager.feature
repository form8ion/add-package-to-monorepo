Feature: Package Manager

  Scenario: npm
    Given the monorepo is lerna
    And the package will be tested
    And the monorepo uses "npm" as the package manager
    And the dialect is "babel"
    And nvm is properly configured
    When the project is scaffolded
    Then the package is added to the monorepo
    And npm is used to manage the new package

  Scenario: yarn
    Given the monorepo is lerna
    And the package will be tested
    And the monorepo uses "yarn" as the package manager
    And the dialect is "babel"
    And nvm is properly configured
    When the project is scaffolded
    Then the package is added to the monorepo
    And yarn is used to manage the new package
