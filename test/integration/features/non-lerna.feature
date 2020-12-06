Feature: Other monorepo type

  Scenario: Unsupported monorepo
    When the project is scaffolded
    Then feedback is provided that the monorepo is unsupported
