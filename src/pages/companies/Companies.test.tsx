import { render, screen } from "../../utils/test-utils";
import Companies from "./Companies";
import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock hooks
vi.mock("../../hooks/useCompanies", () => ({
    useCompanies: vi.fn(() => ({
        companies: [{ _id: "1", name: "Test Company" }],
        isLoading: false,
        createCompany: vi.fn(),
        updateCompany: vi.fn(),
        deleteCompany: vi.fn(),
    })),
}));

vi.mock("../../hooks/useIsMobile", () => ({
    useIsMobile: vi.fn(() => false), // Desktop view
}));

// Mock RoleGuard to always allow access
vi.mock("../../components/auth/RoleGuard", () => ({
    RoleGuard: ({ children }: any) => <>{children}</>,
}));

// Mock Child Components
vi.mock("./components/CompanyTable", () => ({ default: () => <div data-testid="company-table">CompanyTable</div> }));
vi.mock("./components/CompanyCardList", () => ({ default: () => <div data-testid="company-card-list">CompanyCardList</div> }));
vi.mock("./components/CompanyModal", () => ({ default: () => <div data-testid="company-modal">CompanyModal</div> }));

describe("Companies Page", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders companies page", () => {
        render(<Companies />);

        expect(screen.getByText("Breadcrumbs.COMPANIES")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Companies.SEARCH")).toBeInTheDocument();

        // Check if table is rendered (desktop mode)
        expect(screen.getByTestId("company-table")).toBeInTheDocument();
    });
});
