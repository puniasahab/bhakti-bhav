import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import NewJaapMalaDetails from "./NewJaapMalaDetails";
import { categoryContentApis, newJaapMalaApis } from "../api";
import { LanguageContext } from "../contexts/LanguageContext";

jest.mock("react-router-dom", () => {
  global.TextEncoder = require("util").TextEncoder;
  global.TextDecoder = require("util").TextDecoder;
  return jest.requireActual("react-router");
}, { virtual: true });
jest.mock("../api", () => ({
  categoryContentApis: { fetchContentDetailsByContentId: jest.fn() },
  newJaapMalaApis: {
    getJaapMalaCount: jest.fn(),
    updateJaapMalaCount: jest.fn(),
    getJaapStreak: jest.fn(),
  },
}));
jest.mock("../components/Header", () => () => <div>Header</div>);
jest.mock("../components/SEO", () => () => null);

let routeId = 0;
async function openPage() {
  render(
    <LanguageContext.Provider value={{ language: "hinglish", fontSize: "text-base" }}>
      <MemoryRouter initialEntries={[`/jaap/${++routeId}`]}>
        <Routes><Route path="/jaap/:id" element={<NewJaapMalaDetails />} /></Routes>
      </MemoryRouter>
    </LanguageContext.Provider>
  );
  return within(await screen.findByRole("group", { name: "108 mantra repetitions" })).getAllByRole("button");
}

beforeEach(() => {
  jest.clearAllMocks();
  categoryContentApis.fetchContentDetailsByContentId.mockResolvedValue({ data: {
    title: { hinglish: "विष्णु जी<br />(Vishnu Ji)" }, imageUrl: "/vishnu.png",
  } });
  newJaapMalaApis.getJaapMalaCount.mockResolvedValue({ data: { jaap: {
    totalMala: 3, currentMalaCounter: 1, malaSize: 108,
  } } });
  newJaapMalaApis.getJaapStreak.mockResolvedValue({ data: { currentStreak: 2 } });
  newJaapMalaApis.updateJaapMalaCount.mockResolvedValue({});
  jest.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute("open", ""); };
  HTMLDialogElement.prototype.close = function () { this.removeAttribute("open"); };
});
afterEach(() => jest.restoreAllMocks());

test("shows all 108 names initially and advances in order even when a later name is tapped", async () => {
  const names = await openPage();
  expect(names).toHaveLength(108);
  expect(names.every((name) => name.getAttribute("aria-pressed") === "false")).toBe(true);
  fireEvent.click(names[40]);
  expect(names[0]).toHaveAttribute("aria-pressed", "true");
  expect(names[40]).toHaveAttribute("aria-pressed", "false");
  fireEvent.click(screen.getByRole("button", { name: "Tap here to start jaap" }));
  expect(names[1]).toHaveAttribute("aria-current", "step");
  expect(screen.getByRole("status")).toHaveTextContent("2 of 108");
  expect(newJaapMalaApis.updateJaapMalaCount).not.toHaveBeenCalled();
});

test("persists once at 108 chants and resets only the active round for the next mala", async () => {
  const names = await openPage();
  const tap = screen.getByRole("button", { name: "Tap here to start jaap" });
  for (let i = 0; i < 108; i++) fireEvent.click(tap);
  expect(names.every((name) => name.getAttribute("aria-pressed") === "true")).toBe(true);
  expect(screen.getByRole("dialog", { name: "🙏 Congratulations! 🙏" })).toBeInTheDocument();
  expect(newJaapMalaApis.updateJaapMalaCount).toHaveBeenCalledTimes(1);
  expect(newJaapMalaApis.updateJaapMalaCount).toHaveBeenCalledWith(String(routeId), 108);
  fireEvent.click(tap);
  expect(newJaapMalaApis.updateJaapMalaCount).toHaveBeenCalledTimes(1);
  await waitFor(() => expect(newJaapMalaApis.getJaapMalaCount).toHaveBeenCalledTimes(2));
  fireEvent.click(screen.getByRole("button", { name: "Start Next Mala" }));
  expect(names.every((name) => name.getAttribute("aria-pressed") === "false")).toBe(true);
  expect(screen.getByRole("status")).toHaveTextContent("0 of 108");
  fireEvent.click(tap);
  expect(names[0]).toHaveAttribute("aria-pressed", "true");
});

test("changes all mantra labels without losing progress or changing the deity title", async () => {
  const names = await openPage();
  fireEvent.click(names[0]);
  fireEvent.click(screen.getByRole("button", { name: "मंत्र बदलें" }));
  fireEvent.change(screen.getByLabelText("God name or mantra"), { target: { value: "नारायण" } });
  fireEvent.click(screen.getByRole("button", { name: "Apply" }));
  expect(names.every((name) => name.textContent === "नारायण")).toBe(true);
  expect(names[0]).toHaveAttribute("aria-pressed", "true");
  expect(screen.getByRole("status")).toHaveTextContent("1 of 108");
  expect(screen.getByText("(Vishnu Ji)")).toBeInTheDocument();
  expect(newJaapMalaApis.updateJaapMalaCount).not.toHaveBeenCalled();
});

test("scrolls the next highlighted name into the repetition viewport", async () => {
  const names = await openPage();
  const viewport = screen.getByRole("group", { name: "108 mantra repetitions" });
  Object.defineProperty(viewport, "offsetTop", { value: 300 });
  Object.defineProperty(viewport, "clientHeight", { value: 64 });
  Object.defineProperty(names[2], "offsetTop", { value: 120 });
  Object.defineProperty(names[2], "offsetHeight", { value: 24 });
  for (let i = 0; i < 3; i++) fireEvent.click(names[i]);
  expect(viewport.scrollTop).toBe(80);
});
