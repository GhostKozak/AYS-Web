import { render, screen } from "../../utils/test-utils";
import Drivers from "./Drivers";
import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock hooks
vi.mock("../../hooks/useDrivers", () => ({
    useDrivers: vi.fn(() => ({
        drivers: [{ _id: "1", full_name: "John Doe", phone_number: "123" }],
        isLoading: false,
        createDriver: vi.fn(),
        updateDriver: vi.fn(),
        deleteDriver: vi.fn(),
    })),
}));

vi.mock("../../hooks/useCompanies", () => ({
    useCompanies: vi.fn(() => ({
        companies: [],
    })),
}));

vi.mock("../../hooks/useIsMobile", () => ({
    useIsMobile: vi.fn(() => false),
}));

vi.mock("../../components/auth/RoleGuard", () => ({
    RoleGuard: ({ children }: any) => <>{children}</>,
}));

// Mock Components
vi.mock("./components/DriverTable", () => ({ default: () => <div data-testid="driver-table">DriverTable</div> }));
vi.mock("./components/DriverCardList", () => ({ default: () => <div data-testid="driver-card-list">DriverCardList</div> }));
vi.mock("./components/DriverModal", () => ({ default: () => <div data-testid="driver-modal">DriverModal</div> }));

describe("Drivers Page", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders drivers page", () => {
        render(<Drivers />);

        expect(screen.getByText("Breadcrumbs.DRIVERS")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Drivers.SEARCH")).toBeInTheDocument();
        expect(screen.getByTestId("driver-table")).toBeInTheDocument();
    });
});
