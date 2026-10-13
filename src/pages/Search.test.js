import { act, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import SearchPage from "./Search";
import { homePageAPis } from "../api";
import { LanguageContext } from "../contexts/LanguageContext";
import { getSubscriptionStatusFromLS, getTokenFromLS } from "../commonFunctions";

jest.mock("react-router-dom", () => {
  global.TextEncoder = require("util").TextEncoder;
  global.TextDecoder = require("util").TextDecoder;
  // CRA's Jest resolver predates react-router-dom's package exports.
  return jest.requireActual("react-router");
}, { virtual: true });
jest.mock("../api", () => ({ homePageAPis: { searchApi: jest.fn() } }));
jest.mock("../commonFunctions", () => ({
  getSubscriptionStatusFromLS: jest.fn(),
  getTokenFromLS: jest.fn(),
}));

const response = (modules = {}) => ({ status: "success", data: { modules } });
const item = (id, accessType = "free") => ({ id, title: id, accessType, imageUrl: "/image.png" });

function openSearch(from = "/") {
  return render(
    <LanguageContext.Provider value={{ language: "hinglish" }}>
      <MemoryRouter initialEntries={[{ pathname: "/search", state: { from } }]}>
        <Routes>
          <Route path="/search" element={<SearchPage />} />
          <Route path="/" element={<p>Home screen</p>} />
          <Route path="/rashifal" element={<p>Rashifal screen</p>} />
          <Route path="/login" element={<p>Login screen</p>} />
          <Route path="/payment" element={<p>Payment screen</p>} />
          <Route path="/aarti/:id" element={<p>Aarti detail</p>} />
        </Routes>
      </MemoryRouter>
    </LanguageContext.Provider>
  );
}

async function typeQuery(query) {
  fireEvent.change(screen.getByRole("textbox"), { target: { value: query } });
  await act(async () => { jest.advanceTimersByTime(300); });
}

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
  getSubscriptionStatusFromLS.mockReturnValue(false);
  getTokenFromLS.mockReturnValue(null);
  homePageAPis.searchApi.mockResolvedValue(response());
});
afterEach(() => { jest.useRealTimers(); });

test("waits for two trimmed characters and debounces typing", async () => {
  openSearch();
  expect(screen.getByPlaceholderText("Search deities, mantras, vrat...")).toHaveFocus();
  expect(screen.getByText("Type at least 2 characters to search")).toBeInTheDocument();
  await typeQuery(" h ");
  expect(homePageAPis.searchApi).not.toHaveBeenCalled();
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "ha" } });
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "hanuman" } });
  await act(async () => { jest.advanceTimersByTime(300); });
  expect(homePageAPis.searchApi).toHaveBeenCalledTimes(1);
  expect(homePageAPis.searchApi).toHaveBeenCalledWith("hanuman", "hinglish", 50, expect.any(AbortSignal));
  expect(screen.getByText('No results found for "hanuman"')).toBeInTheDocument();
});

test("renders nonempty modules, hides empty groups and protects paid content", async () => {
  homePageAPis.searchApi.mockResolvedValue(response({
    vratKatha: [item("Katha", "paid")], chalisa: [], arti: [item("Aarti")],
    wallpaper: [{ ...item("wallpaper"), title: "" }],
  }));
  openSearch();
  await typeQuery("hanuman");
  expect(screen.getByRole("heading", { name: "Vrat Katha" })).toBeInTheDocument();
  expect(screen.queryByRole("heading", { name: "Chalisa" })).not.toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Katha (subscription required)" })).toHaveAttribute("href", "/login");
  expect(screen.getByRole("link", { name: "Wallpaper" })).toHaveAttribute("href", "/wallpaper/wallpaper");
  fireEvent.click(screen.getByRole("link", { name: "Aarti" }));
  expect(screen.getByText("Aarti detail")).toBeInTheDocument();
});

test.each([
  [false, "token", "/payment"],
  [true, "token", "/chalisa/Chalisa"],
])("respects subscription=%s for signed-in content", async (subscribed, token, href) => {
  getSubscriptionStatusFromLS.mockReturnValue(subscribed);
  getTokenFromLS.mockReturnValue(token);
  homePageAPis.searchApi.mockResolvedValue(response({ chalisa: [item("Chalisa", "paid")] }));
  openSearch();
  await typeQuery("hanuman");
  expect(screen.getByRole("link")).toHaveAttribute("href", href);
});

test("aborts old searches and ignores late results", async () => {
  let resolveOld;
  homePageAPis.searchApi.mockImplementationOnce(() => new Promise((resolve) => { resolveOld = resolve; }));
  openSearch();
  await typeQuery("old");
  const oldSignal = homePageAPis.searchApi.mock.calls[0][3];
  homePageAPis.searchApi.mockResolvedValue(response({ mantra: [item("New result")] }));
  await typeQuery("new");
  expect(oldSignal.aborted).toBe(true);
  await act(async () => { resolveOld(response({ mantra: [item("Old result")] })); });
  expect(screen.getByText("New result")).toBeInTheDocument();
  expect(screen.queryByText("Old result")).not.toBeInTheDocument();
});

test("restarts an aborted pending request when only whitespace changes", async () => {
  homePageAPis.searchApi.mockImplementationOnce(() => new Promise(() => {}));
  openSearch();
  await typeQuery("hanuman");
  await typeQuery("hanuman ");
  expect(homePageAPis.searchApi).toHaveBeenCalledTimes(2);
  expect(screen.getByText('No results found for "hanuman"')).toBeInTheDocument();
});

test.each(["network", "malformed"])("shows retry for %s failures", async (kind) => {
  if (kind === "network") homePageAPis.searchApi.mockRejectedValueOnce(new Error("offline"));
  else homePageAPis.searchApi.mockResolvedValueOnce({ status: "error" });
  openSearch();
  await typeQuery("hanuman");
  expect(screen.getByRole("alert")).toHaveTextContent("Unable to load results");
  fireEvent.click(screen.getByRole("button", { name: "Try again" }));
  await act(async () => { jest.advanceTimersByTime(300); });
  expect(screen.getByText('No results found for "hanuman"')).toBeInTheDocument();
});

test.each([
  ["Back to home", "Home screen"],
  ["Close search", "Rashifal screen"],
])("%s cancels the request and navigates correctly", async (button, destination) => {
  homePageAPis.searchApi.mockImplementationOnce(() => new Promise(() => {}));
  openSearch("/rashifal");
  await typeQuery("hanuman");
  const signal = homePageAPis.searchApi.mock.calls[0][3];
  fireEvent.click(screen.getByRole("button", { name: button }));
  expect(signal.aborted).toBe(true);
  expect(screen.getByText(destination)).toBeInTheDocument();
});

test("deleting the query cancels loading and restores the initial screen", async () => {
  homePageAPis.searchApi.mockImplementationOnce(() => new Promise(() => {}));
  openSearch();
  await typeQuery("hanuman");
  const signal = homePageAPis.searchApi.mock.calls[0][3];
  await typeQuery("");
  expect(signal.aborted).toBe(true);
  expect(screen.getByText("Type at least 2 characters to search")).toBeInTheDocument();
});
