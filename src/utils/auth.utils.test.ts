import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getUser, hasRole } from "./auth.utils";
import { STORAGE_KEYS } from "../constants";
import { UserRole } from "../types";

describe("auth.utils", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getUser", () => {
    it("should return null if no user in localStorage", () => {
      expect(getUser()).toBeNull();
    });

    it("should return parsed user object if valid JSON in localStorage", () => {
      const mockUser = { id: 1, name: "Test User", role: UserRole.ADMIN };
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(mockUser));

      expect(getUser()).toEqual(mockUser);
    });

    it("should return null (or throw/handle gracefully) if invalid JSON", () => {
      // JSON.parse throws on invalid JSON. The current implementation of getUser
      // doesn't try/catch, so it would throw.
      // Let's verify behavior. If it throws, we might want to refactor the util later,
      // but for now let's document current behavior: it throws.
      localStorage.setItem(STORAGE_KEYS.USER, "invalid-json");
      expect(() => getUser()).toThrow();
    });
  });

  describe("hasRole", () => {
    it("should return false if user is not logged in", () => {
      expect(hasRole([UserRole.ADMIN])).toBe(false);
    });

    it("should return true if user has one of the allowed roles", () => {
      const mockUser = { id: 1, role: UserRole.ADMIN };
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(mockUser));

      expect(hasRole([UserRole.ADMIN, UserRole.USER])).toBe(true);
    });

    it("should return false if user does not have allowed roles", () => {
      const mockUser = { id: 1, role: UserRole.USER };
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(mockUser));

      expect(hasRole([UserRole.ADMIN])).toBe(false);
    });
  });
});
