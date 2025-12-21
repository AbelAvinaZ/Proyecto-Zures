import { jest } from "@jest/globals";

jest.mock("../src/utils/mailer.js", () => ({
    default: jest.fn().mockImplementation(() => Promise.resolve(true)),
}));