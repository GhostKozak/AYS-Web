import { renderHook } from "@testing-library/react";
import {
    useCompanyStats,
    useMonthCompanyStats,
    useVehicleUnloadStats,
    useDailyTripStats,
    useCalendarStats,
} from "./useDashboard";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock utilities
vi.mock("../utils/date.utils", async () => {
    const actual = await vi.importActual("../utils/date.utils");
    return {
        ...actual,
        getNow: () => new Date("2023-10-15T12:00:00Z"), // Fixed date for testing
        getLast7Days: () => [
            { dateStr: "2023-10-09", dayName: "Mon" },
            { dateStr: "2023-10-10", dayName: "Tue" },
            { dateStr: "2023-10-11", dayName: "Wed" },
            { dateStr: "2023-10-12", dayName: "Thu" },
            { dateStr: "2023-10-13", dayName: "Fri" },
            { dateStr: "2023-10-14", dayName: "Sat" },
            { dateStr: "2023-10-15", dayName: "Sun" },
        ],
    };
});

describe("useDashboard Hooks", () => {
    const mockTrips = [
        {
            id: "1",
            company: { id: "c1", name: "Company A" },
            arrival_time: "2023-10-15T10:00:00Z", // Same day, same month
            unload_status: "COMPLETED",
        },
        {
            id: "2",
            company: { id: "c2", name: "Company B" },
            arrival_time: "2023-10-14T10:00:00Z", // Different day, same month
            unload_status: "WAITING",
        },
        {
            id: "3",
            company: { id: "c1", name: "Company A" },
            arrival_time: "2023-09-15T10:00:00Z", // Different month
            unload_status: "COMPLETED",
        },
    ];

    describe("useCompanyStats", () => {
        it("should return empty array if no trips", () => {
            const { result } = renderHook(() => useCompanyStats([]));
            expect(result.current).toEqual([]);
        });

        it("should aggregate trips by company", () => {
            const { result } = renderHook(() => useCompanyStats(mockTrips as any));
            // Company A: 2 trips, Company B: 1 trip
            expect(result.current).toHaveLength(2);
            expect(result.current[0]).toEqual({ id: "Company A", value: 2 });
            expect(result.current[1]).toEqual({ id: "Company B", value: 1 });
        });
    });

    describe("useMonthCompanyStats", () => {
        it("should return NO_DATA if no trips", () => {
            const { result } = renderHook(() => useMonthCompanyStats([]));
            expect(result.current[0].id).toBe("Table.NO_DATA");
        });

        it("should filter trips by current month (Oct 2023)", () => {
            const { result } = renderHook(() => useMonthCompanyStats(mockTrips as any));
            // Trip 1 (Oct 15) & Trip 2 (Oct 14) should be included. Trip 3 (Sep) excluded.
            // Company A (1 trip in Oct), Company B (1 trip in Oct)
            expect(result.current).toHaveLength(2);
            // Sort order might depend on implementation details if values are equal, but both have 1
            const companies = result.current.map((i) => i.id).sort();
            expect(companies).toEqual(["Company A", "Company B"]);
        });
    });

    describe("useVehicleUnloadStats", () => {
        it("should return NO_DATA if no trips", () => {
            const { result } = renderHook(() => useVehicleUnloadStats([]));
            expect(result.current[0].id).toBe("Table.NO_DATA");
        });

        it("should filter trips by current day (2023-10-15)", () => {
            const { result } = renderHook(() => useVehicleUnloadStats(mockTrips as any));
            // Only Trip 1 is on 2023-10-15
            expect(result.current).toHaveLength(1);
            expect(result.current[0].id).toBe("Trips.STATUS_COMPLETED");
            expect(result.current[0].value).toBe(1);
        });
    });

    describe("useDailyTripStats", () => {
        it("should map trips to last 7 days", () => {
            const { result } = renderHook(() => useDailyTripStats(mockTrips as any));

            // Oct 15 (Sun): Trip 1 (COMPLETED)
            const sunday = result.current.find(d => d.date === "2023-10-15");
            expect(sunday?.COMPLETED).toBe(1);

            // Oct 14 (Sat): Trip 2 (WAITING)
            const saturday = result.current.find(d => d.date === "2023-10-14");
            expect(saturday?.WAITING).toBe(1);

            // Sep 15: Should not be in last 7 days
        });
    });

    describe("useCalendarStats", () => {
        it("should aggregate trips by date", () => {
            const { result } = renderHook(() => useCalendarStats(mockTrips as any));
            // 2023-10-15: 1
            // 2023-10-14: 1
            // 2023-09-15: 1
            expect(result.current).toHaveLength(3);
            const oct15 = result.current.find(d => d.day === "2023-10-15");
            expect(oct15?.value).toBe(1);
        })
    })
});
