Feature: Lerna

  Scenario: Add Package
    Given nvm is properly configured
    When the project is scaffolded
    Then the package is added to the monorepo
