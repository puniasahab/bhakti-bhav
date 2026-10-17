import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
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
async function openPage({ state, hasMantras = true } = {}) {
  render(
    <LanguageContext.Provider value={{ language: "hinglish", fontSize: "text-base" }}>
      <MemoryRouter initialEntries={[{ pathname: `/jaap/${++routeId}`, state }]}>
        <Routes><Route path="/jaap/:id" element={<NewJaapMalaDetails />} /></Routes>
      </MemoryRouter>
    </LanguageContext.Provider>
  );
  await screen.findByRole("button", { name: "Tap here to start jaap" });
  return hasMantras ? within(screen.getByRole("group", { name: "108 mantra repetitions" })).getAllByRole("button") : [];
}

beforeEach(() => {
  jest.clearAllMocks();
  categoryContentApis.fetchContentDetailsByContentId.mockResolvedValue({ data: {
    title: { hinglish: "विष्णु जी<br />(Vishnu Ji)" }, imageUrl: "/vishnu.png",
    mantras: [{ _id: "narayan", hi: "नारायण" }, { _id: "vasudev", hi: "ॐ नमो भगवते वासुदेवाय" }],
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
  fireEvent.click(screen.getByRole("button", { name: "अपना मंत्र लिखें" }));
  fireEvent.change(screen.getByLabelText("God name or mantra"), { target: { value: "नारायण" } });
  fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
  expect(names.every((name) => name.textContent === "नारायण")).toBe(true);
  expect(names[0]).toHaveAttribute("aria-pressed", "true");
  expect(screen.getByRole("status")).toHaveTextContent("1 of 108");
  expect(screen.getByText("(Vishnu Ji)")).toBeInTheDocument();
  expect(newJaapMalaApis.updateJaapMalaCount).not.toHaveBeenCalled();
});

test("refreshes completion totals and the shared streak only after saving the completed mala", async () => {
  let finishSaving;
  let finishStreak;
  newJaapMalaApis.updateJaapMalaCount.mockReturnValueOnce(new Promise((resolve) => { finishSaving = resolve; }));
  newJaapMalaApis.getJaapMalaCount
    .mockResolvedValueOnce({ data: { jaap: { totalMala: 7, currentMalaCounter: 1, malaSize: 108 } } })
    .mockResolvedValueOnce({ data: { jaap: { totalMala: 8, currentMalaCounter: 2, malaSize: 108 } } });
  newJaapMalaApis.getJaapStreak
    .mockResolvedValueOnce({ data: { currentStreak: 1 } })
    .mockReturnValueOnce(new Promise((resolve) => { finishStreak = resolve; }));
  await openPage();
  const tap = screen.getByRole("button", { name: "Tap here to start jaap" });
  for (let i = 0; i < 107; i++) fireEvent.click(tap);
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  fireEvent.click(tap);
  const modal = screen.getByRole("dialog", { name: "🙏 Congratulations! 🙏" });
  expect(within(modal).getByText("Total Malas: 8")).toBeInTheDocument();
  expect(within(modal).getByText("Streak: 1 Day")).toBeInTheDocument();
  expect(newJaapMalaApis.getJaapStreak).toHaveBeenCalledTimes(1);
  await act(async () => { finishSaving({}); });
  expect(newJaapMalaApis.getJaapStreak).toHaveBeenCalledTimes(2);
  await act(async () => { finishStreak({ data: { currentStreak: 2 } }); });
  expect(within(modal).getByText("Streak: 2 Days")).toBeInTheDocument();
  expect(within(modal).getByText("Total Malas: 8")).toBeInTheDocument();
  expect(within(modal).getByText("Total Malas: 8").closest("[aria-live]")).toHaveAttribute("aria-busy", "false");
  expect(screen.getByText("2 Days")).toBeInTheDocument();
  fireEvent.click(within(modal).getByRole("button", { name: "Start Next Mala" }));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(screen.getByRole("status")).toHaveTextContent("0 of 108");
  expect(screen.getByText("2 Days")).toBeInTheDocument();
  expect(newJaapMalaApis.updateJaapMalaCount).toHaveBeenCalledTimes(1);
});

test("keeps the last known streak and allows the next mala if streak refresh fails", async () => {
  const logError = jest.spyOn(console, "error").mockImplementation(() => {});
  newJaapMalaApis.getJaapStreak
    .mockResolvedValueOnce({ data: { currentStreak: 2 } })
    .mockRejectedValueOnce(new Error("Streak unavailable"));
  await openPage();
  const tap = screen.getByRole("button", { name: "Tap here to start jaap" });
  for (let i = 0; i < 108; i++) fireEvent.click(tap);
  const modal = screen.getByRole("dialog", { name: "🙏 Congratulations! 🙏" });
  await waitFor(() => expect(within(modal).getByText("Streak: 2 Days").closest("[aria-live]")).toHaveAttribute("aria-busy", "false"));
  expect(logError).toHaveBeenCalledWith("Error fetching Jaap streak:", expect.any(Error));
  fireEvent.click(within(modal).getByRole("button", { name: "Start Next Mala" }));
  fireEvent.click(tap);
  expect(screen.getByRole("status")).toHaveTextContent("1 of 108");
});

test("shows an unavailable streak without inventing a day count", async () => {
  newJaapMalaApis.getJaapStreak.mockResolvedValue({ data: {} });
  await openPage();
  const tap = screen.getByRole("button", { name: "Tap here to start jaap" });
  for (let i = 0; i < 108; i++) fireEvent.click(tap);
  const modal = screen.getByRole("dialog", { name: "🙏 Congratulations! 🙏" });
  await waitFor(() => expect(within(modal).getByText("Streak: —").closest("[aria-live]")).toHaveAttribute("aria-busy", "false"));
});

test("repeats the selection from the list and changes it without resetting chants", async () => {
  const names = await openPage({ state: { selectedMantraKey: "vasudev" } });
  expect(names.every((name) => name.textContent === "ॐ नमो भगवते वासुदेवाय")).toBe(true);
  fireEvent.click(names[0]);
  fireEvent.click(screen.getByRole("button", { name: "मंत्र बदलें" }));
  expect(screen.getByRole("radio", { name: "ॐ नमो भगवते वासुदेवाय" })).toBeChecked();
  fireEvent.click(screen.getByRole("radio", { name: "नारायण" }));
  fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
  expect(names.every((name) => name.textContent === "नारायण")).toBe(true);
  expect(names[0]).toHaveAttribute("aria-pressed", "true");
  expect(screen.getByRole("status")).toHaveTextContent("1 of 108");
  expect(screen.getByText("(Vishnu Ji)")).toBeInTheDocument();
});

test("retains list mantras when the detail response omits the field", async () => {
  categoryContentApis.fetchContentDetailsByContentId.mockResolvedValue({ data: { title: "Vishnu" } });
  const names = await openPage({ state: { item: { mantras: ["Narayan", "Om Namo Narayanaya"] }, selectedMantraKey: "1" } });
  expect(names.every((name) => name.textContent === "Om Namo Narayanaya")).toBe(true);
});

test.each([undefined, null, [], [null, " ", {}]])("hides mantra controls and text for absent/empty mantras but still completes malas: %s", async (mantras) => {
  categoryContentApis.fetchContentDetailsByContentId.mockResolvedValue({ data: { title: "Vishnu", mantras } });
  await openPage({ hasMantras: false });
  expect(screen.queryByRole("group", { name: "108 mantra repetitions" })).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "मंत्र बदलें" })).not.toBeInTheDocument();
  const tap = screen.getByRole("button", { name: "Tap here to start jaap" });
  fireEvent.click(tap);
  expect(tap).not.toHaveTextContent("Vishnu");
  expect(screen.getByRole("status")).toHaveTextContent("1 of 108");
  for (let i = 1; i < 108; i++) fireEvent.click(tap);
  expect(newJaapMalaApis.updateJaapMalaCount).toHaveBeenCalledTimes(1);
  expect(screen.getByRole("dialog", { name: "🙏 Congratulations! 🙏" })).toBeInTheDocument();
  await waitFor(() => expect(newJaapMalaApis.getJaapMalaCount).toHaveBeenCalledTimes(2));
});

test("honors explicitly empty detail mantras even when the list had options", async () => {
  categoryContentApis.fetchContentDetailsByContentId.mockResolvedValue({ data: { title: "Vishnu", mantras: [] } });
  await openPage({ hasMantras: false, state: { item: { mantras: ["Narayan"] }, selectedMantraKey: "0" } });
  expect(screen.queryByRole("button", { name: "मंत्र बदलें" })).not.toBeInTheDocument();
  expect(screen.queryByRole("group", { name: "108 mantra repetitions" })).not.toBeInTheDocument();
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
