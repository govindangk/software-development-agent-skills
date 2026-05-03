# Package Templates

## Shared Deno workspace config (always scaffold this first)

Deno 2.x manages TypeScript natively — no tsconfig package needed. Shared
compiler options live in the **root `deno.json`** and propagate to all workspace
members automatically.

**Root `deno.json`** (add alongside root `package.json`):
```json
{
  "workspace": ["apps/*", "packages/*", "libs/*"],
  "compilerOptions": {
    "strict": true,
    "target": "ES2022",
    "lib": ["ES2022", "dom"]
  },
  "fmt": {
    "lineWidth": 100,
    "indentWidth": 2,
    "semiColons": true
  },
  "lint": {
    "rules": {
      "include": ["no-unused-vars", "no-explicit-any"]
    }
  }
}
```

Each member package declares its own `deno.json` with tasks. The workspace root
config is automatically inherited — no `extends` needed.

---

## TypeScript library

**Location:** `packages/<name>/`

```
packages/<name>/
├── package.json     ← turbo shim
├── deno.json        ← Deno tasks + imports + exports
└── src/
    └── index.ts
```

`deno.json`:
```json
{
  "name": "@repo/<name>",
  "version": "0.0.0",
  "exports": "./src/index.ts",
  "tasks": {
    "build": "deno check src/index.ts",
    "test":  "deno test --allow-all src/",
    "lint":  "deno lint",
    "fmt":   "deno fmt --check"
  },
  "imports": {}
}
```

`package.json` (turbo shim only — no npm deps for pure Deno libs):
```json
{
  "name": "@repo/<name>",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "build": "deno task build",
    "test":  "deno task test",
    "lint":  "deno task lint",
    "clean": "rm -rf dist"
  }
}
```

`src/index.ts` — import other workspace packages using the `@repo/` scope:
```typescript
import { something } from "@repo/other-package";
```

Deno resolves `@repo/*` imports via the workspace `deno.json` — no install step needed.

---

## Next.js app

**Location:** `apps/<name>/`

Next.js runs under Deno 2.x via npm compatibility mode. Deno handles the
runtime; Next.js npm packages are resolved through `nodeModulesDir`.

```
apps/<name>/
├── package.json
├── deno.json
├── next.config.ts
└── src/
    └── app/
        └── page.tsx
```

`deno.json`:
```json
{
  "name": "@repo/<name>",
  "version": "0.0.0",
  "nodeModulesDir": "auto",
  "tasks": {
    "dev":   "deno run --allow-all npm:next dev",
    "build": "deno run --allow-all npm:next build",
    "start": "deno run --allow-all npm:next start",
    "lint":  "deno run --allow-all npm:next lint"
  }
}
```

`package.json`:
```json
{
  "name": "@repo/<name>",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "dev":   "deno task dev",
    "build": "deno task build",
    "start": "deno task start",
    "lint":  "deno task lint",
    "clean": "rm -rf .next"
  },
  "dependencies": {
    "next": "latest",
    "react": "latest",
    "react-dom": "latest"
  },
  "devDependencies": {
    "@types/react": "latest",
    "@types/react-dom": "latest",
    "typescript": "latest"
  }
}
```

`next.config.ts`:
```typescript
import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
};

export default config;
```

**Note:** `pnpm install` is still required to populate `node_modules` for
Next.js. Deno uses those modules at runtime via `nodeModulesDir: "auto"`.

---

## Go service

**Location:** `libs/<name>/` (or `apps/<name>/` if it's a deployable binary)

```
libs/<name>/
├── package.json     ← turbo entrypoint only
├── Makefile
├── go.mod
├── go.sum
└── cmd/
    └── main.go
```

`package.json` (turbo shim — no npm deps):
```json
{
  "name": "@repo/<name>",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "build": "make build",
    "test":  "make test",
    "lint":  "golangci-lint run ./...",
    "clean": "rm -rf bin/"
  }
}
```

`Makefile`:
```makefile
.PHONY: build test lint clean

build:
	go build -o bin/<name> ./cmd/...

test:
	go test ./...

lint:
	golangci-lint run ./...

clean:
	rm -rf bin/
```

Add a turbo.json pipeline entry in the **root** `turbo.json`:
```json
"libs/<name>#build": {
  "dependsOn": [],
  "outputs": ["bin/**"],
  "cache": true
}
```

---

## Python worker

**Location:** `libs/<name>/`

```
libs/<name>/
├── package.json     ← turbo shim
├── pyproject.toml
└── src/
    └── <name>/
        └── __init__.py
```

`package.json`:
```json
{
  "name": "@repo/<name>",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "build": "uv sync && uv build",
    "test":  "uv run pytest",
    "lint":  "uv run ruff check .",
    "clean": "rm -rf dist .venv"
  }
}
```

---

## Rust crate

**Location:** `libs/<name>/`

```
libs/<name>/
├── package.json     ← turbo shim
├── Cargo.toml
└── src/
    └── lib.rs       (or main.rs for a binary)
```

`package.json`:
```json
{
  "name": "@repo/<name>",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "build": "cargo build --release",
    "test":  "cargo test",
    "lint":  "cargo clippy -- -D warnings",
    "clean": "cargo clean"
  }
}
```

`Cargo.toml`:
```toml
[package]
name = "<name>"
version = "0.1.0"
edition = "2021"

[lib]
# Remove if building a binary; use [[bin]] instead
crate-type = ["cdylib", "rlib"]

[profile.release]
opt-level = 3
lto = true
```

Root `turbo.json` pipeline entry:
```json
"libs/<name>#build": {
  "dependsOn": [],
  "outputs": ["target/release/**"],
  "cache": false
}
```

**Workspace note:** If multiple Rust crates exist, add a `Cargo.toml` workspace
manifest at the repo root to share `target/` and lock files:
```toml
[workspace]
members = ["libs/<name-a>", "libs/<name-b>"]
resolver = "2"
```

---

## C++ library / service

**Location:** `libs/<name>/`

```
libs/<name>/
├── package.json     ← turbo shim
├── CMakeLists.txt
├── include/
│   └── <name>.h
└── src/
    └── <name>.cpp
```

`package.json`:
```json
{
  "name": "@repo/<name>",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "build": "cmake -B build -DCMAKE_BUILD_TYPE=Release && cmake --build build --parallel",
    "test":  "cd build && ctest --output-on-failure",
    "lint":  "clang-tidy src/*.cpp -- -Iinclude",
    "clean": "rm -rf build"
  }
}
```

`CMakeLists.txt`:
```cmake
cmake_minimum_required(VERSION 3.20)
project(<name> VERSION 0.1.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

add_library(<name> src/<name>.cpp)
target_include_directories(<name> PUBLIC include)

# Uncomment for a binary instead:
# add_executable(<name> src/main.cpp)

enable_testing()
# add_subdirectory(tests)
```

Root `turbo.json` pipeline entry:
```json
"libs/<name>#build": {
  "dependsOn": [],
  "outputs": ["build/**"],
  "cache": false
}
```

**Toolchain note:** Recommend `cmake` ≥ 3.20 and `clang` or `gcc` ≥ 12 for C++20
support. If the project uses `vcpkg` or `conan`, add the manifest file
(`vcpkg.json` / `conanfile.txt`) at the package root.

---

## Java (17 or 21) + Spring Boot

**Location:** `libs/<name>/` or `apps/<name>/`

```
apps/<name>/
├── package.json          ← turbo shim
├── build.gradle.kts
├── settings.gradle.kts
├── gradle/
│   └── wrapper/
│       └── gradle-wrapper.properties
└── src/
    ├── main/
    │   ├── java/<pkg>/
    │   │   └── Application.java
    │   └── resources/
    │       └── application.yml
    └── test/java/<pkg>/
```

`package.json`:
```json
{
  "name": "@repo/<name>",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "build": "./gradlew bootJar",
    "dev":   "./gradlew bootRun",
    "test":  "./gradlew test",
    "lint":  "./gradlew checkstyleMain spotbugsMain",
    "clean": "./gradlew clean"
  }
}
```

`settings.gradle.kts`:
```kotlin
rootProject.name = "<name>"
```

`build.gradle.kts`:
```kotlin
plugins {
    java
    id("org.springframework.boot") version "3.2.0"
    id("io.spring.dependency-management") version "1.1.4"
    checkstyle
    id("com.github.spotbugs") version "6.0.0"
}

// Set to 17 or 21 depending on user choice
val javaVersion = JavaVersion.VERSION_21

java {
    sourceCompatibility = javaVersion
    targetCompatibility = javaVersion
    toolchain {
        languageVersion.set(JavaLanguageVersion.of(javaVersion.majorVersion))
    }
}

repositories {
    mavenCentral()
}

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-actuator")
    testImplementation("org.springframework.boot:spring-boot-starter-test")
}

tasks.test {
    useJUnitPlatform()
}

checkstyle {
    toolVersion = "10.12.0"
}
```

`src/main/java/<pkg>/Application.java`:
```java
package <pkg>;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

`src/main/resources/application.yml`:
```yaml
spring:
  application:
    name: <name>

server:
  port: 8080
```

`gradle/wrapper/gradle-wrapper.properties`:
```properties
distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\://services.gradle.org/distributions/gradle-8.5-bin.zip
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
```

Root `turbo.json` pipeline entry:
```json
"apps/<name>#build": {
  "dependsOn": ["^build"],
  "outputs": ["build/libs/**"],
  "cache": false
}
```

**Java version:** Ask the user whether they want 17 or 21, then set
`JavaLanguageVersion.of(17|21)` in the toolchain block. Both are LTS releases.
- Java 17 — wider enterprise compatibility, stable ecosystem default
- Java 21 — virtual threads (`Project Loom`), pattern matching, record patterns;
  prefer for greenfield services

**Multi-module note:** If multiple Spring Boot services exist, prefer a single
Gradle multi-project build. Add each module to `settings.gradle.kts`:
```kotlin
include(":service-a", ":service-b")
```
and use a shared `build.gradle.kts` at root for common plugin/dependency config
via `subprojects {}`.

---

## React Native / Expo app

**Location:** `apps/<name>/`

`package.json`:
```json
{
  "name": "@repo/<name>",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "build": "expo export",
    "dev":   "expo start",
    "lint":  "expo lint",
    "clean": "rm -rf dist"
  }
}
```

---

## Notes

- Every template includes a `clean` script — turbo tracks this for cache invalidation
- Go, Python, Rust, C++, and Java `package.json` shims exist solely so turbo can address them as workspace packages
- For Go: `go.work` is optional but recommended when multiple Go modules coexist
- Deno is the runtime for all TypeScript/JavaScript — `tsc`, `eslint`, `vitest`, and `ts-node` are never used
- Deno resolves `@repo/*` cross-package imports natively via workspace `deno.json` — no build/compile step needed between TS packages
- Next.js apps still require `pnpm install` for npm compat; all other Deno packages do not
