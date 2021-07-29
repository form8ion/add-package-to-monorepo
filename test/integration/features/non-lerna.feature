Feature: Other monorepo type

  Scenario: Unsupported monorepo
    Given the dialect is "babel"
    When the project is scaffolded
    And the monorepo uses "npm" as the package manager
    Then feedback is provided that the monorepo is unsupported
