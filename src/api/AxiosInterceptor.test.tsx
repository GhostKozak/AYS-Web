import React, { useEffect } from "react";
import { render, waitFor } from "@testing-library/react"; // Using native render, not custom render
import { AxiosInterceptor } from "./AxiosInterceptor";
import apiClient from "./apiClient";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { STORAGE_KEYS, ROUTES } from "../constants";

// Mock dependencies
const mockNavigate = vi.fn();
const mockMessage = { warning: vi.fn(), error: vi.fn() };
const mockNotification = { error: vi.fn() };

vi.mock("react-router", async () => {
    const actual = await vi.importActual("react-router");
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

// Mock Ant Design App context
vi.mock("antd", async () => {
    const actual = await vi.importActual("antd");
    return {
        ...actual,
        App: {
            useApp: () => ({
                message: mockMessage,
                notification: mockNotification,
            }),
        },
    };
});

describe("AxiosInterceptor", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    afterEach(() => {
        // Clear interceptors to avoid side effects
        (apiClient.interceptors.response as any).handlers = [];
    });

    const renderInterceptor = () => {
        render(<AxiosInterceptor />);
    };

    it("should handle 401 Unauthorized error", async () => {
        renderInterceptor();

        // Simulate 401 response
        const error = {
            response: { status: 401 },
        };

        // Assert that the interceptor was added
        expect((apiClient.interceptors.response as any).handlers.length).toBeGreaterThan(0);

        // Get the rejected handler
        const interceptor = (apiClient.interceptors.response as any).handlers[0];
        const onRejected = interceptor.rejected;

        try {
            await onRejected(error);
        } catch (e) {
            // Expected to reject
        }

        expect(mockMessage.warning).toHaveBeenCalled();
        expect(localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)).toBeNull();
        expect(mockNavigate).toHaveBeenCalledWith(ROUTES.LOGIN);
    });

    it("should handle 403 Forbidden error", async () => {
        renderInterceptor();

        const error = {
            response: { status: 403 },
        };

        const interceptor = (apiClient.interceptors.response as any).handlers[0];
        const onRejected = interceptor.rejected;

        try {
            await onRejected(error);
        } catch (e) { }

        expect(mockNotification.error).toHaveBeenCalledWith(expect.objectContaining({
            message: "Yetkisiz Erişim",
        }));
    });

    it("should handle 500 Server error", async () => {
        renderInterceptor();

        const error = {
            response: { status: 500 },
        };

        const interceptor = (apiClient.interceptors.response as any).handlers[0];
        const onRejected = interceptor.rejected;

        try {
            await onRejected(error);
        } catch (e) { }

        expect(mockNotification.error).toHaveBeenCalledWith(expect.objectContaining({
            message: "Sunucu Hatası",
        }));
    });

    it("should handle Network error", async () => {
        renderInterceptor();

        const error = {
            code: "ERR_NETWORK",
        };

        const interceptor = (apiClient.interceptors.response as any).handlers[0];
        const onRejected = interceptor.rejected;

        try {
            await onRejected(error);
        } catch (e) { }

        expect(mockMessage.error).toHaveBeenCalledWith("İnternet bağlantınızı kontrol ediniz.");
    });
});
