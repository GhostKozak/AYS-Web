import { render, screen, fireEvent } from "../../utils/test-utils";
import Header from "./Header";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { STORAGE_KEYS } from "../../constants";

// Mock hooks
const mockNavigate = vi.fn();
vi.mock("react-router", async () => {
    const actual = await vi.importActual<any>("react-router");
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        useLocation: () => ({ pathname: "/" }),
    };
});

const mockToggleTheme = vi.fn();
vi.mock("../../utils/AppConfigProvider", () => ({
    useAppConfig: () => ({
        themeMode: "light",
        toggleTheme: mockToggleTheme,
    }),
    AppConfigProvider: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("../../hooks/useIsMobile", () => ({
    useIsMobile: vi.fn(() => false), // Default to desktop
}));

describe("Header Component", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it("renders logo and subtitle", () => {
        render(<Header />);
        // Note: We use the translation keys in tests because t() is mocked to return key by default (or we can assume standard behavior)
        // But since we use a custom render which wraps AppConfigProvider -> it uses real i18next if not fully mocked.
        // In setupTests.ts we likely mocked i18next.
        // Let's assume t returns the key as we have seen in previous output or standard mock.
        // If t returns key, we look for "Common.APP_SUBTITLE".
        // If it returns translation, we might fail unless we know the translation.
        // Usually setupTests mocks t to return key.

        // We can just check existence of some elements.
        // The logo uses CONFIG.APP.NAME which is constant.
        expect(screen.getByText(/Common.APP_SUBTITLE/)).toBeInTheDocument();
    });

    it("shows login button when not logged in", () => {
        render(<Header />);
        expect(screen.getByText("Header.LOGIN")).toBeInTheDocument();
    });

    it("shows user info when logged in", () => {
        const user = { firstName: "John", lastName: "Doe", role: "admin", email: "test@test.com" };
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

        render(<Header />);

        expect(screen.getByText("John")).toBeInTheDocument();
        expect(screen.getByText("admin")).toBeInTheDocument();
        expect(screen.queryByText("Header.LOGIN")).not.toBeInTheDocument();
    });

    it("calls navigate on logout", () => {
        const user = { firstName: "John", role: "admin" };
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

        render(<Header />);

        // Open dropdown (Antd Dropdown usually triggers on hover or click)
        // In test environment, we might need to click the user name/avatar to open dropdown.
        const userTrigger = screen.getByText("John");
        fireEvent.click(userTrigger);

        // Antd user menu items might be rendered in a Portal.
        // We need to look for "Header.LOGOUT".
        // Since Dropdown renders in document body, existing query might find it if we wait or just query screen.
        const logoutParams = screen.getByText("Header.LOGOUT");
        fireEvent.click(logoutParams);

        expect(mockNavigate).toHaveBeenCalledWith("/login");
        expect(localStorage.getItem(STORAGE_KEYS.USER)).toBeNull();
    });

    it("toggles theme", () => {
        const user = { firstName: "John", role: "admin" };
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        render(<Header />);

        const userTrigger = screen.getByText("John");
        fireEvent.click(userTrigger);

        // Find theme toggle item (Light/Dark mode)
        // It depends on current mock state (light) -> shows "Header.DARK_MODE"
        const toggleBtn = screen.getByText("Header.DARK_MODE");
        fireEvent.click(toggleBtn);

        expect(mockToggleTheme).toHaveBeenCalled();
    });
});
