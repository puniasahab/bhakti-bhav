import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import NewJaapMala from "./NewJaapMala";
import { LanguageContext } from "../contexts/LanguageContext";
import { newJaapMalaApis } from "../api";
import { getSubscriptionStatusFromLS, getTokenFromLS } from "../commonFunctions";

jest.mock("react-router-dom", () => {
  global.TextEncoder = require("util").TextEncoder;
  global.TextDecoder = require("util").TextDecoder;
  return jest.requireActual("react-router");
}, { virtual: true });
jest.mock("../api", () => ({ newJaapMalaApis: { getJaapMalaDatav4: jest.fn() } }));
jest.mock("../components/Loader", () => () => <p>Loading</p>);
jest.mock("../components/PageTitleCard", () => () => <h1>Jaap Mala</h1>);
jest.mock("../components/SEO", () => () => null);
jest.mock("../components/SchemaMarkup", () => () => null);
jest.mock("../hooks/useGA4BaseParams", () => () => ({}));
jest.mock("../hooks/useGA4Tracker", () => () => ({ trackEvent: jest.fn() }));
jest.mock("../commonFunctions", () => ({ getSubscriptionStatusFromLS: jest.fn(), getTokenFromLS: jest.fn(), replaceSpecialChars: value => value }));

const item = (id, extra = {}) => ({ _id: id, title: id, imageUrl: `https://api.bhaktibhav.app/${id}.webp`, isPaid: false, isWithoutLoginFree: true, ...extra });
const response = (items, page = 1, totalPages = 1) => ({ data: { message: "Fetch Content Successfully", data: items, pagination: { totalRecords: 11, page, limit: 10, totalPages } } });
let counter = 0;
function Details() { return <pre data-testid="detail-state">{JSON.stringify(useLocation().state)}</pre>; }
function openPage({ category = `category-${++counter}`, language = "hinglish", query = false } = {}) {
  const view = (lang) => <LanguageContext.Provider value={{ language: lang }}><MemoryRouter initialEntries={[query ? `/newjaapMaala?categoryId=${category}` : `/newjaapMaala/${category}`]}><Routes>
    <Route path="/newjaapMaala/:categoryId?" element={<NewJaapMala />} />
    <Route path="/newJaapMaala-details/:id" element={<Details />} />
    <Route path="/login" element={<p>Login page</p>} />
    <Route path="/payment" element={<p>Payment page</p>} />
  </Routes></MemoryRouter></LanguageContext.Provider>;
  const result = render(view(language));
  return { ...result, category, changeLanguage: (lang) => result.rerender(view(lang)) };
}
beforeEach(() => {
  jest.clearAllMocks();
  getSubscriptionStatusFromLS.mockReturnValue(false);
  getTokenFromLS.mockReturnValue(null);
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute("open", ""); };
  HTMLDialogElement.prototype.close = function () { this.removeAttribute("open"); };
  jest.spyOn(window, "requestAnimationFrame").mockImplementation(callback => { callback(); return 1; });
});
afterEach(() => jest.restoreAllMocks());

test("loads nested v4 data in the existing image cards and passes the full item to details", async () => {
  const first = item("विष्णु जी");
  newJaapMalaApis.getJaapMalaDatav4.mockResolvedValue(response([first, item("दुर्गा")]));
  const { category } = openPage();
  const image = await screen.findByAltText("विष्णु जी");
  expect(newJaapMalaApis.getJaapMalaDatav4).toHaveBeenCalledWith("hinglish", category, 1, 10);
  expect(image).toHaveAttribute("src", first.imageUrl);
  expect(image).toHaveClass("h-[150px]", "object-cover");
  expect(screen.getAllByRole("link")).toHaveLength(2);
  fireEvent.click(image);
  expect(JSON.parse(screen.getByTestId("detail-state").textContent)).toEqual({ item: first, categoryId: category });
});

test("opens the mantra picker and sends the confirmed selection with the full item", async () => {
  const first = item("विष्णु जी", { mantras: [{ hi: "नारायण", en: "Narayan" }, { hi: "ॐ नमो नारायणाय" }, { _id: "vasudev", hi: "ॐ नमो भगवते वासुदेवाय" }] });
  newJaapMalaApis.getJaapMalaDatav4.mockResolvedValue(response([first]));
  const { category } = openPage();
  fireEvent.click(await screen.findByAltText("विष्णु जी"));
  const dialog = screen.getByRole("dialog", { name: "मंत्र का चयन करें" });
  expect(within(dialog).getByRole("radio", { name: "नारायण" })).toBeChecked();
  expect(screen.queryByTestId("detail-state")).not.toBeInTheDocument();
  fireEvent.click(within(dialog).getByRole("radio", { name: "ॐ नमो भगवते वासुदेवाय" }));
  fireEvent.click(within(dialog).getByRole("button", { name: "Confirm" }));
  expect(JSON.parse(screen.getByTestId("detail-state").textContent)).toEqual({ item: first, categoryId: category, selectedMantraKey: "vasudev" });
  expect(document.body.style.overflow).toBe("");
});

test.each([undefined, null, [], [null, " ", {}]])("skips selection for missing or empty mantras: %s", async (mantras) => {
  newJaapMalaApis.getJaapMalaDatav4.mockResolvedValue(response([item("plain", { mantras })]));
  openPage();
  fireEvent.click(await screen.findByAltText("plain"));
  expect(screen.getByTestId("detail-state")).toBeInTheDocument();
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});

test("cancels selection without navigating and defaults to the first mantra when reopened", async () => {
  newJaapMalaApis.getJaapMalaDatav4.mockResolvedValue(response([item("Vishnu", { mantras: ["Narayan", "Om Namo Narayanaya"] })]));
  openPage({ language: "en" });
  const card = await screen.findByAltText("Vishnu");
  fireEvent.click(card);
  fireEvent.click(screen.getByRole("radio", { name: "Om Namo Narayanaya" }));
  fireEvent.click(screen.getByRole("button", { name: "Close" }));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(screen.queryByTestId("detail-state")).not.toBeInTheDocument();
  fireEvent.click(card);
  expect(screen.getByRole("radio", { name: "Narayan" })).toBeChecked();
  fireEvent(screen.getByRole("dialog"), new Event("cancel", { bubbles: true, cancelable: true }));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});

test.each([[null, "Login page"], ["token", "Payment page"]])("keeps restricted content access checks before mantra selection: %s", async (token, destination) => {
  getTokenFromLS.mockReturnValue(token);
  newJaapMalaApis.getJaapMalaDatav4.mockResolvedValue(response([item("restricted", { isPaid: true, isWithoutLoginFree: false, mantras: ["Narayan"] })]));
  openPage();
  fireEvent.click(await screen.findByAltText("restricted"));
  expect(screen.getByText(destination)).toBeInTheDocument();
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});

test("appends page two and stops at the API's totalPages", async () => {
  newJaapMalaApis.getJaapMalaDatav4.mockResolvedValueOnce(response(Array.from({ length: 10 }, (_, i) => item(`mala-${i}`)), 1, 2)).mockResolvedValueOnce(response([item("last-mala")], 2, 2));
  const { category } = openPage();
  await screen.findByAltText("mala-0");
  fireEvent.scroll(window);
  await screen.findByAltText("last-mala");
  expect(newJaapMalaApis.getJaapMalaDatav4).toHaveBeenLastCalledWith("hinglish", category, 2, 10);
  expect(screen.getAllByRole("link")).toHaveLength(11);
  fireEvent.scroll(window);
  expect(newJaapMalaApis.getJaapMalaDatav4).toHaveBeenCalledTimes(2);
});

test.each([[null, false, "/login"], ["token", false, "/payment"], ["token", true, "/newJaapMaala-details/paid"]])("preserves paid access for token=%s, subscription=%s", async (token, subscribed, href) => {
  getTokenFromLS.mockReturnValue(token);
  getSubscriptionStatusFromLS.mockReturnValue(subscribed);
  newJaapMalaApis.getJaapMalaDatav4.mockResolvedValue(response([item("paid", { isPaid: true, isWithoutLoginFree: false }), item("free-without-login", { isPaid: true })]));
  openPage();
  expect((await screen.findByAltText("paid")).closest("a")).toHaveAttribute("href", href);
  expect(screen.getByAltText("free-without-login").closest("a")).toHaveAttribute("href", "/newJaapMaala-details/free-without-login");
});

test("uses the query category and refreshes data for the selected language", async () => {
  newJaapMalaApis.getJaapMalaDatav4.mockResolvedValueOnce(response([item("विष्णु जी")])).mockResolvedValueOnce(response([item("Vishnu Ji")]));
  const { category, changeLanguage } = openPage({ query: true });
  await screen.findByAltText("विष्णु जी");
  changeLanguage("en");
  await screen.findByAltText("Vishnu Ji");
  expect(newJaapMalaApis.getJaapMalaDatav4).toHaveBeenLastCalledWith("en", category, 1, 10);
});

test("ignores a stale response when the language changes", async () => {
  let resolveOld;
  newJaapMalaApis.getJaapMalaDatav4.mockReturnValueOnce(new Promise(resolve => { resolveOld = resolve; })).mockResolvedValueOnce(response([item("English result")]));
  const { changeLanguage } = openPage();
  await waitFor(() => expect(newJaapMalaApis.getJaapMalaDatav4).toHaveBeenCalledTimes(1));
  changeLanguage("en");
  await screen.findByAltText("English result");
  await act(async () => { resolveOld(response([item("Old result")])); });
  expect(screen.queryByAltText("Old result")).not.toBeInTheDocument();
});

test("keeps the existing empty state for an empty v4 list", async () => {
  newJaapMalaApis.getJaapMalaDatav4.mockResolvedValue(response([]));
  openPage();
  expect(await screen.findByText(/No items found/)).toBeInTheDocument();
});
