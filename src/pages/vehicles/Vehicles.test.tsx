import { render, screen } from "../../utils/test-utils";
import Vehicles from "./Vehicles";
import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("../../hooks/useVehicles", () => ({
    useVehicles: vi.fn(() => ({
        vehicles: [{ _id: "1", licence_plate: "34ABC123" }],
        isLoading: false,
        createVehicle: vi.fn(),
        updateVehicle: vi.fn(),
        deleteVehicle: vi.fn(),
    })),
}));

vi.mock("../../hooks/useIsMobile", () => ({
    useIsMobile: vi.fn(() => false),
}));

vi.mock("../../components/auth/RoleGuard", () => ({
    RoleGuard: ({ children }: any) => <>{children}</>,
}));

vi.mock("./components/VehicleTable", () => ({ default: () => <div data-testid="vehicle-table">VehicleTable</div> }));
vi.mock("./components/VehicleCardList", () => ({ default: () => <div data-testid="vehicle-card-list">VehicleCardList</div> }));
vi.mock("./components/VehicleModal", () => ({ default: () => <div data-testid="vehicle-modal">VehicleModal</div> }));

describe("Vehicles Page", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders vehicles page", () => {
        render(<Vehicles />);

        expect(screen.getByText("Breadcrumbs.VEHICLES")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Vehicles.SEARCH")).toBeInTheDocument();
        expect(screen.getByTestId("vehicle-table")).toBeInTheDocument();
    });
});
