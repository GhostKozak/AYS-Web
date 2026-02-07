import { render, screen } from "../../utils/test-utils"; // Using custom render
import DashboardPage from "./DashboardPage";
import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock hooks
vi.mock("../../hooks/useTrips", () => ({
    useTrips: vi.fn(() => ({
        trips: [],
        isLoading: false,
        isError: false,
    })),
}));

// Mock child components to avoid deep rendering and focus on Page logic
vi.mock("./components/CompanyDistribution", () => ({ default: () => <div data-testid="company-distribution">CompanyDistribution</div> }));
vi.mock("./components/MonthlyCompanyDistribution", () => ({ default: () => <div data-testid="monthly-company-distribution">MonthlyCompanyDistribution</div> }));
vi.mock("./components/StatsOverview", () => ({ default: () => <div data-testid="stats-overview">StatsOverview</div> }));
vi.mock("./components/UnloadedStatus", () => ({ default: () => <div data-testid="unloaded-status">UnloadedStatus</div> }));
vi.mock("./components/WeeklyActivityChart", () => ({ default: () => <div data-testid="weekly-activity-chart">WeeklyActivityChart</div> }));
vi.mock("./components/YearlyActivityMap", () => ({ default: () => <div data-testid="yearly-activity-map">YearlyActivityMap</div> }));
vi.mock("./components/LiveOperationsList", () => ({ default: () => <div data-testid="live-operations-list">LiveOperationsList</div> }));
vi.mock("./components/DashboardWidget", () => ({
    DashboardWidget: ({ title, children, onClose }: any) => (
        <div data-testid="dashboard-widget">
            <span>{title}</span>
            <button onClick={onClose}>Close</button>
            {children}
        </div>
    ),
}));

// Mock react-grid-layout
vi.mock("react-grid-layout/legacy", () => ({
    Responsive: ({ children }: any) => <div data-testid="responsive-grid-layout">{children}</div>,
    WidthProvider: (Component: any) => (props: any) => <Component {...props} />,
}));

describe("DashboardPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders dashboard components", () => {
        render(<DashboardPage />);
        expect(screen.getByText("Dashboard.TITLE")).toBeInTheDocument();
    });
});
