# Test Utilities

This directory contains shared testing utilities and configuration for the Fraud Intelligence Portal.

## Files

### `setup.ts`

Global test setup file that runs before each test file. Includes:

- Testing Library cleanup
- jsdom polyfills for Ant Design components
- Mock setup for browser APIs (matchMedia, IntersectionObserver, ResizeObserver)
- MSW server configuration (commented out, ready for API mocking)

### `utils.tsx`

Custom render utilities for React Testing Library:

- `customRender()`: Wraps components with all necessary providers (Router, Ant Design, Refine)
- Helper functions for common testing scenarios
- Re-exports all React Testing Library utilities for convenience

## Usage

### Basic Component Test

```tsx
import { render, screen } from "@/test/utils";
import { MyComponent } from "./MyComponent";

describe("MyComponent", () => {
  it("should render correctly", () => {
    render(<MyComponent />);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });
});
```

### Test with Custom Route

```tsx
import { render, screen } from "@/test/utils";
import { MyComponent } from "./MyComponent";

describe("MyComponent", () => {
  it("should render at specific route", () => {
    render(<MyComponent />, { initialRoute: "/dashboard" });
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });
});
```

### Test with User Interactions

```tsx
import { render, screen, userEvent } from "@/test/utils";
import { MyComponent } from "./MyComponent";

describe("MyComponent", () => {
  it("should handle button click", async () => {
    const user = userEvent.setup();
    render(<MyComponent />);

    const button = screen.getByRole("button", { name: /submit/i });
    await user.click(button);

    expect(screen.getByText("Success")).toBeInTheDocument();
  });
});
```

## Best Practices

1. **Always use custom render**: Import `render` from `@/test/utils` instead of `@testing-library/react`
2. **Use semantic queries**: Prefer `getByRole`, `getByLabelText`, etc. over `getByTestId`
3. **Test user behavior**: Focus on testing from the user's perspective
4. **Avoid implementation details**: Don't test internal state or methods
5. **Use async utilities**: Use `userEvent` instead of `fireEvent` for user interactions
6. **Clean up**: Tests automatically clean up after each test via the setup file

## Adding MSW for API Mocking

To enable MSW for API mocking:

1. Uncomment the MSW setup in `setup.ts`
2. Create `src/test/mocks/handlers.ts` with your API handlers
3. Use MSW to mock API responses in your tests

Example:

```tsx
import { server } from "@/test/setup";
import { http, HttpResponse } from "msw";

test("should fetch data", async () => {
  server.use(
    http.get("/api/rules", () => {
      return HttpResponse.json({ rules: [] });
    })
  );

  // Your test code
});
```

## Resources

- [React Testing Library Documentation](https://testing-library.com/react)
- [Vitest Documentation](https://vitest.dev/)
- [MSW Documentation](https://mswjs.io/)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
