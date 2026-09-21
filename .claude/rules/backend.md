---
paths:
  - "src/RoboWash.Api/**"
  - "src/RoboWash.xUnit/**"
  - "db/**"
---

# Backend: C#, EF Core, Postgres

`src/RoboWash.Api/` keeps every role in a folder of its own: Controllers, Services (+ Models for service results),
Data (DbContext, entities), Contracts, Enums, Extensions, Utils.

## Naming

- Services end with `Service`: `LocationService _locationService` (parameter `locationService`), never `_location`.
  Service names collide with entity names (`Location`, `WashSession`), and the suffix keeps them distinct at every
  call site.
- `_db` for the DbContext is the one accepted exception.

## C# / .NET

- Primary constructors for DI classes; captured parameters take no underscore prefix.
- No interfaces without a second implementation — register concrete classes in DI.
- Pure helper (no I/O, no state, nothing to mock) → static class. Needs I/O or per-request state → DI service.
  Never inject a service only to reach a pure function it happens to contain — that is coupling with nothing
  behind it.
- Entities in `Data/` stay plain data with no behaviour, not even a rule stated purely in their own fields: the
  shape of a row changes with the schema, a business rule changes with the business, and one file should not
  answer to both. Such a rule is an extension method on the entity it is about, in `Extensions/`:
  `washLocation.IsModeAvailable(washMode)` reads like the entity's own method while the entity stays plain data.
  A pure helper that belongs to no single type goes to `Utils/`.
- Skip ceremony modifiers (`sealed`, blanket `readonly`, `[Pure]`) — write it the way a developer would, not the
  way an analyzer suggests.
- An `if` whose body is a single statement drops the braces and puts the statement on the next line. Braces come
  back once the body grows past one statement.
- Controller actions always have a block body, never `=>`: an expression-bodied action reads badly and leaves no
  line of its own for a breakpoint. Extension methods and other one-expression helpers keep `=>`.
- When the declaration already names the type — a return type, a field — `new()` is enough:
  `WashSessionResponse ToResponse(...) => new() { ... }`. With `var`, the type stays after `new`.
- Controllers are not thin pass-throughs: an action must not reduce to `return _xService.X(...)` under the same
  name — that duplicates naming and hides where the logic lives. Request shaping, validation and response mapping
  belong in the action; reusable domain and data work belongs in a service. The one exception is a list, see below:
  its projection is data work, so the service already returns the contract and the action hands it back as is.
- Mapping one entity to its response is an extension method in `Extensions/` — `washSession.ToResponse()` — and
  the action stays a readable sequence of steps. A list never goes through it: the query projects straight into
  the contract with `Select(s => new XResponse { ... })`, so only the listed columns leave the database and nothing
  is tracked. `ToResponse()` inside that query would make EF load whole rows just to call it. A list usually shows
  far fewer fields than a detail view (a catalogue row is a name, a price and a picture; the product page adds the
  description and the specs) — then the list gets its own `XListItemResponse`. While the two shapes match, one
  contract serves both.
- Async all the way for I/O, `CancellationToken` from the action down to the EF Core call.
- Entities and properties stay PascalCase, tables and columns in Postgres are snake_case: quoted identifiers turn
  every hand-written query into a chore. The mapping is configured once globally, never per property.
- Constraints in the schema only where the application needs one. A unique index on a natural-looking key blocks
  archiving later: a retired location and the one replacing it legitimately share an address.
- DTOs and service result models are records with init-only properties, never positional records, and they are
  built with object initializers. Every value is then labelled at the call site: reordering two properties of the
  same type cannot silently swap them, and the compiler still catches a missing `required` one.
- Enums live in `Enums/`, shared by entities and contracts alike. `Contracts` never references `Data` — the shape
  that goes over the wire must not depend on how rows are stored.
- One type per file, in a folder that names its role: a service's result model belongs in `Services/Models/`,
  not beside the service that returns it.
- LINQ lambda parameters are single letters (`l`, `m`) — they live for one line. Type and method names stay long
  and precise. Public methods hand back `IReadOnlyList<T>`, not `List<T>`, and a one-line condition goes inline
  instead of into a private helper.
