# Workspace Rules

- Always prioritize using reusable UI components (like `<Input>`, `<Button>`, `<Select>`) that have been created in the `components/ui/` directory instead of raw HTML elements like `<input>` or `<button>`.
- Avoid using nested ternary operators (e.g., `condition1 ? A : condition2 ? B : C`). Instead, use explicit `if/else` blocks, early returns, or separate components/variables to improve code readability.
