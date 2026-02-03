/**
 * Tests for Review Workflow Utilities
 */

import { describe, it, expect } from "vitest";
import type { TransactionStatus } from "../../../types/review";
import {
  canAssign,
  canResolve,
  canEscalate,
  getActionAvailability,
  STATUS_DESCRIPTIONS,
  ACTION_DESCRIPTIONS,
} from "../reviewWorkflow";

describe("reviewWorkflow utilities", () => {
  describe("canAssign", () => {
    it("returns true for PENDING status", () => {
      expect(canAssign("PENDING")).toBe(true);
    });

    it("returns true for IN_REVIEW status", () => {
      expect(canAssign("IN_REVIEW")).toBe(true);
    });

    it("returns true for ESCALATED status", () => {
      expect(canAssign("ESCALATED")).toBe(true);
    });

    it("returns true for RESOLVED status", () => {
      expect(canAssign("RESOLVED")).toBe(true);
    });

    it("returns false for CLOSED status", () => {
      expect(canAssign("CLOSED")).toBe(false);
    });
  });

  describe("canResolve", () => {
    it("returns false for PENDING status", () => {
      expect(canResolve("PENDING")).toBe(false);
    });

    it("returns true for IN_REVIEW status", () => {
      expect(canResolve("IN_REVIEW")).toBe(true);
    });

    it("returns true for ESCALATED status", () => {
      expect(canResolve("ESCALATED")).toBe(true);
    });

    it("returns false for RESOLVED status", () => {
      expect(canResolve("RESOLVED")).toBe(false);
    });

    it("returns false for CLOSED status", () => {
      expect(canResolve("CLOSED")).toBe(false);
    });
  });

  describe("canEscalate", () => {
    it("returns false for PENDING status", () => {
      expect(canEscalate("PENDING")).toBe(false);
    });

    it("returns true for IN_REVIEW status", () => {
      expect(canEscalate("IN_REVIEW")).toBe(true);
    });

    it("returns false for ESCALATED status", () => {
      expect(canEscalate("ESCALATED")).toBe(false);
    });

    it("returns false for RESOLVED status", () => {
      expect(canEscalate("RESOLVED")).toBe(false);
    });

    it("returns false for CLOSED status", () => {
      expect(canEscalate("CLOSED")).toBe(false);
    });
  });

  describe("getActionAvailability", () => {
    it("returns correct availability for PENDING status", () => {
      const result = getActionAvailability("PENDING");
      expect(result).toEqual({
        canAssign: true,
        canResolve: false,
        canEscalate: false,
        canTransition: true,
        availableTransitions: ["IN_REVIEW"],
      });
    });

    it("returns correct availability for IN_REVIEW status", () => {
      const result = getActionAvailability("IN_REVIEW");
      expect(result).toEqual({
        canAssign: true,
        canResolve: true,
        canEscalate: true,
        canTransition: true,
        availableTransitions: ["ESCALATED", "RESOLVED"],
      });
    });

    it("returns correct availability for ESCALATED status", () => {
      const result = getActionAvailability("ESCALATED");
      expect(result).toEqual({
        canAssign: true,
        canResolve: true,
        canEscalate: false,
        canTransition: true,
        availableTransitions: ["IN_REVIEW", "RESOLVED"],
      });
    });

    it("returns correct availability for RESOLVED status", () => {
      const result = getActionAvailability("RESOLVED");
      expect(result).toEqual({
        canAssign: true,
        canResolve: false,
        canEscalate: false,
        canTransition: true,
        availableTransitions: ["CLOSED", "IN_REVIEW"],
      });
    });

    it("returns correct availability for CLOSED status", () => {
      const result = getActionAvailability("CLOSED");
      expect(result).toEqual({
        canAssign: false,
        canResolve: false,
        canEscalate: false,
        canTransition: false,
        availableTransitions: [],
      });
    });
  });

  describe("STATUS_DESCRIPTIONS", () => {
    it("has descriptions for all statuses", () => {
      const statuses: TransactionStatus[] = [
        "PENDING",
        "IN_REVIEW",
        "ESCALATED",
        "RESOLVED",
        "CLOSED",
      ];

      statuses.forEach((status) => {
        expect(STATUS_DESCRIPTIONS[status]).toBeDefined();
        expect(typeof STATUS_DESCRIPTIONS[status]).toBe("string");
      });
    });
  });

  describe("ACTION_DESCRIPTIONS", () => {
    it("has descriptions for all actions", () => {
      expect(ACTION_DESCRIPTIONS.assign).toBeDefined();
      expect(ACTION_DESCRIPTIONS.resolve).toBeDefined();
      expect(ACTION_DESCRIPTIONS.escalate).toBeDefined();
      expect(ACTION_DESCRIPTIONS.transition).toBeDefined();
    });
  });
});
