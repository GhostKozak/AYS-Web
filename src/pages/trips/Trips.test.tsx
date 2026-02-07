import { render, screen } from "../../utils/test-utils";
import Trips from "./Trips";
import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("../../hooks/useTrips", () => ({
    useTrips: vi.fn(() => ({
        trips: [{ _id: "1", status: "WAITING" }],
        isLoading: false,
        createTrip: vi.fn(),
        updateTrip: vi.fn(),
        deleteTrip: vi.fn(),
    })),
}));

vi.mock("../../hooks/useCompanies", () => ({ useCompanies: vi.fn(() => ({ companies: [] })) }));
vi.mock("../../hooks/useDrivers", () => ({ useDrivers: vi.fn(() => ({ drivers: [] })) }));
vi.mock("../../hooks/useVehicles", () => ({ useVehicles: vi.fn(() => ({ vehicles: [] })) }));

vi.mock("../../hooks/useIsMobile", () => ({
    useIsMobile: vi.fn(() => false),
}));

vi.mock("../../components/auth/RoleGuard", () => ({
    RoleGuard: ({ children }: any) => <>{children}</>,
}));

vi.mock("./components/TripTable", () => ({ default: () => <div data-testid="trip-table">TripTable</div> }));
vi.mock("./components/TripCardList", () => ({ default: () => <div data-testid="trip-card-list">TripCardList</div> }));
vi.mock("./components/TripModal", () => ({ default: () => <div data-testid="trip-modal">TripModal</div> }));

describe("Trips Page", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders trips page", () => {
        render(<Trips />);

        expect(screen.getByText("Breadcrumbs.TRIPS")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Trips.SEARCH")).toBeInTheDocument();
        expect(screen.getByTestId("trip-table")).toBeInTheDocument();
    });
});
