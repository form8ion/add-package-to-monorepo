Feature: Other monorepo type

  Scenario: Unsupported monorepo
    Given the dialect is "babel"
    When the project is scaffolded
    Then the monorepo uses "npm" as the package manager
    And feedback is provided that the monorepo is unsupported
