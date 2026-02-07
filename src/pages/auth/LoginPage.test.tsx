import { render, screen, fireEvent, waitFor } from "../../utils/test-utils";
import LoginPage from "./LoginPage";
import { vi, describe, it, expect, beforeEach } from "vitest";
import apiClient from "../../api/apiClient";
import * as router from "react-router";
import { message } from "antd";
import { STORAGE_KEYS, API_ENDPOINTS, ROUTES } from "../../constants";

// Mock dependencies
vi.mock("../../api/apiClient");
vi.mock("react-router", async () => {
    const actual = await vi.importActual("react-router");
    return {
        ...actual,
        useNavigate: vi.fn(),
    };
});
vi.mock("antd", async () => {
    const actual = await vi.importActual("antd");
    return {
        ...actual,
        message: {
            ...actual.message,
            success: vi.fn(),
            error: vi.fn(),
        },
    };
});

describe("LoginPage", () => {
    const mockNavigate = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        vi.mocked(router.useNavigate).mockReturnValue(mockNavigate);
    });

    it("renders login form correctly", () => {
        render(<LoginPage />);

        expect(screen.getByPlaceholderText("Login.EMAIL_PLACEHOLDER")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Login.PASSWORD_PLACEHOLDER")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Login.BUTTON" })).toBeInTheDocument();
    });

    it("handles successful login", async () => {
        const mockResponse = {
            data: {
                access_token: "fake-token",
                user: { id: 1, name: "Test User" },
            },
        };

        // Setup successful API response
        vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

        render(<LoginPage />);

        // Fill form
        fireEvent.change(screen.getByPlaceholderText("Login.EMAIL_PLACEHOLDER"), {
            target: { value: "test@example.com" },
        });
        fireEvent.change(screen.getByPlaceholderText("Login.PASSWORD_PLACEHOLDER"), {
            target: { value: "password123" },
        });

        // Submit form
        fireEvent.click(screen.getByRole("button", { name: "Login.BUTTON" }));

        // Verify API call
        await waitFor(() => {
            expect(apiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.AUTH.LOGIN, {
                email: "test@example.com",
                password: "password123",
            });
        });

        // Verify LocalStorage
        expect(localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)).toBe("fake-token");
        expect(localStorage.getItem(STORAGE_KEYS.USER)).toBe(JSON.stringify(mockResponse.data.user));

        // Verify Message and Navigation
        expect(message.success).toHaveBeenCalledWith("Login.SUCCESS");
        expect(mockNavigate).toHaveBeenCalledWith(ROUTES.DASHBOARD);
    });

    it("handles login error", async () => {
        // Setup failed API response
        vi.mocked(apiClient.post).mockRejectedValue(new Error("Login failed"));

        render(<LoginPage />);

        // Fill form
        fireEvent.change(screen.getByPlaceholderText("Login.EMAIL_PLACEHOLDER"), {
            target: { value: "test@example.com" },
        });
        fireEvent.change(screen.getByPlaceholderText("Login.PASSWORD_PLACEHOLDER"), {
            target: { value: "wrongpassword" },
        });

        // Submit form
        fireEvent.click(screen.getByRole("button", { name: "Login.BUTTON" }));

        // Verify API call
        await waitFor(() => {
            expect(apiClient.post).toHaveBeenCalled();
        });

        // Verify Error Message
        expect(message.error).toHaveBeenCalledWith("Login.ERROR");

        // Verify NO Navigation
        expect(mockNavigate).not.toHaveBeenCalled();
    });
});
