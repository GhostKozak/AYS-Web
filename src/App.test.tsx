import { render, screen } from "./utils/test-utils";
import App from "./App";

describe("App Component", () => {
  it("renders without crashing", () => {
    // Artık Provider veya Router ile sarmalamaya gerek yok!
    // customRender hepsini hallediyor.
    render(<App />);

    expect(document.body).toBeInTheDocument();
  });
});
