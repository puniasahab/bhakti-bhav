import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Profile from "./Profile";
import EditProfile from "./EditProfile";
import { profileApis } from "../api";
import { getTokenFromLS, setTokenInLS } from "../commonFunctions";

jest.mock("react-router-dom", () => {
  global.TextEncoder = require("util").TextEncoder;
  global.TextDecoder = require("util").TextDecoder;
  return jest.requireActual("react-router");
}, { virtual: true });
jest.mock("../api", () => ({ profileApis: { getProfile: jest.fn(), updateProfile: jest.fn() } }));
jest.mock("../components/Header", () => () => <div>Header</div>);
jest.mock("../utils/metaPixel", () => ({ trackCustomEvent: jest.fn() }));
jest.mock("../hooks/useGA4BaseParams", () => () => ({}));
jest.mock("../hooks/useGA4Tracker", () => () => ({ trackEvent: jest.fn() }));

const baseProfile = { _id: "test-user", name: "New User", mobileNumber: "9876543210", email: "devotee@example.com", gender: "male" };
function openPage(path = "/profile") {
  return render(<MemoryRouter initialEntries={[path]}><Routes>
    <Route path="/profile" element={<Profile />} />
    <Route path="/edit-profile" element={<EditProfile />} />
    <Route path="/transactions" element={<p>Transactions</p>} />
    <Route path="/" element={<p>Home screen</p>} />
  </Routes></MemoryRouter>);
}
function valueFor(label) {
  return within(screen.getByText(label).parentElement).getByRole("definition").textContent;
}
beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  profileApis.getProfile.mockResolvedValue(baseProfile);
  profileApis.updateProfile.mockResolvedValue({ success: true });
});

test("shows all eight fields, preserves New User, and marks only missing data Not Provided", async () => {
  profileApis.getProfile.mockResolvedValue({ ...baseProfile, email: null, gender: null });
  openPage();
  await screen.findByRole("link", { name: "Edit profile" });
  expect(screen.getAllByRole("term")).toHaveLength(8);
  expect(valueFor("Full Name*")).toBe("New User");
  expect(valueFor("Mobile Number*")).toBe("9876543210");
  expect(screen.getAllByText("Not Provided")).toHaveLength(6);
  fireEvent.click(screen.getByRole("link", { name: "Edit profile" }));
  expect(await screen.findByLabelText("FULL NAME*")).toHaveValue("New User");
  expect(screen.getByLabelText("EMAIL*")).toHaveValue("");
  expect(screen.getByLabelText("GENDER")).toHaveValue("");
  expect(screen.getByLabelText("MOBILE NUMBER*")).toHaveAttribute("readonly");
});

test("pre-fills birth details, saves all fields using multipart, then reloads the profile", async () => {
  profileApis.getProfile.mockResolvedValue({ data: { ...baseProfile, state: "Delhi", dateOfBirth: "1998-03-12T00:00:00.000Z", timeOfBirth: "7:05 PM", birthPlace: "Jaipur", imageUrl: "/existing.jpg" } });
  openPage("/edit-profile");
  expect(await screen.findByLabelText("FULL NAME*")).toHaveValue("New User");
  expect(screen.getByLabelText("DATE OF BIRTH")).toHaveValue("1998-03-12");
  expect(screen.getByLabelText("TIME OF BIRTH")).toHaveValue("19:05");
  expect(screen.getByLabelText("LOCATION")).toHaveValue("Delhi");
  fireEvent.change(screen.getByLabelText("FULL NAME*"), { target: { value: "Updated Name" } });
  fireEvent.change(screen.getByLabelText("BIRTH PLACE"), { target: { value: "Agra" } });
  profileApis.getProfile.mockResolvedValue({ ...baseProfile, name: "Updated Name", birthPlace: "Agra", dateOfBirth: "1998-03-12", timeOfBirth: "19:05" });
  fireEvent.click(screen.getByRole("button", { name: "Update Changes" }));
  await screen.findByRole("link", { name: "Edit profile" });
  expect(profileApis.updateProfile).toHaveBeenCalledTimes(1);
  expect(Object.fromEntries(profileApis.updateProfile.mock.calls[0][0].entries())).toEqual({ name: "Updated Name", mobileNumber: "9876543210", email: "devotee@example.com", state: "Delhi", dateOfBirth: "1998-03-12", timeOfBirth: "19:05", birthPlace: "Agra", gender: "male" });
  expect(profileApis.getProfile).toHaveBeenCalledTimes(2);
  expect(valueFor("Birth Place")).toBe("Agra");
  expect(valueFor("Date of Birth")).toBe("12/03/1998");
  expect(valueFor("Time of Birth")).toBe("7:05 PM");
});

test("keeps optional values blank and preserves required field validation", async () => {
  profileApis.getProfile.mockResolvedValue({ ...baseProfile, email: "" });
  openPage("/edit-profile");
  await screen.findByLabelText("FULL NAME*");
  for (const label of ["LOCATION", "DATE OF BIRTH", "TIME OF BIRTH", "BIRTH PLACE"]) expect(screen.getByLabelText(label)).toHaveValue("");
  fireEvent.click(screen.getByRole("button", { name: "Update Changes" }));
  expect(await screen.findByText("Email is required")).toBeInTheDocument();
  expect(profileApis.updateProfile).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText("EMAIL*"), { target: { value: "devotee@example.com" } });
  fireEvent.click(screen.getByRole("button", { name: "Update Changes" }));
  await screen.findByRole("link", { name: "Edit profile" });
  expect(profileApis.updateProfile.mock.calls[0][0].get("dateOfBirth")).toBe("");
});

test("does not expose an empty editable form after a failed load and supports retry", async () => {
  profileApis.getProfile.mockRejectedValueOnce(new Error("Offline"));
  openPage("/edit-profile");
  await screen.findByRole("alert");
  expect(screen.queryByRole("button", { name: "Update Changes" })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Try again" }));
  expect(await screen.findByLabelText("FULL NAME*")).toHaveValue("New User");
});

test("retains edits after a save failure and can retry", async () => {
  profileApis.updateProfile.mockRejectedValueOnce(new Error("Offline"));
  openPage("/edit-profile");
  await screen.findByLabelText("FULL NAME*");
  fireEvent.change(screen.getByLabelText("FULL NAME*"), { target: { value: "Keep this edit" } });
  fireEvent.click(screen.getByRole("button", { name: "Update Changes" }));
  await screen.findByRole("alert");
  expect(screen.getByLabelText("FULL NAME*")).toHaveValue("Keep this edit");
  expect(screen.getByRole("button", { name: "Update Changes" })).toBeEnabled();
  fireEvent.click(screen.getByRole("button", { name: "Update Changes" }));
  await screen.findByRole("link", { name: "Edit profile" });
  expect(profileApis.updateProfile).toHaveBeenCalledTimes(2);
});

test("preserves profile photo upload and prevents duplicate saves while pending", async () => {
  URL.createObjectURL = jest.fn(() => "blob:preview");
  URL.revokeObjectURL = jest.fn();
  profileApis.updateProfile.mockReturnValue(new Promise(() => {}));
  openPage("/edit-profile");
  await screen.findByLabelText("FULL NAME*");
  const file = new File(["photo"], "photo.png", { type: "image/png" });
  fireEvent.change(screen.getByLabelText("Choose photo"), { target: { files: [file] } });
  fireEvent.click(screen.getByRole("button", { name: "Update Changes" }));
  await waitFor(() => expect(profileApis.updateProfile).toHaveBeenCalledTimes(1));
  expect(profileApis.updateProfile.mock.calls[0][0].get("imageUrl").name).toBe("photo.png");
  expect(screen.getByRole("button", { name: "Updating..." })).toBeDisabled();
});

test("fetches coordinates only on request and allows manual entry when denied", async () => {
  const getCurrentPosition = jest.fn((success, failure) => failure());
  Object.defineProperty(navigator, "geolocation", { configurable: true, value: { getCurrentPosition } });
  openPage("/edit-profile");
  await screen.findByLabelText("FULL NAME*");
  expect(getCurrentPosition).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Fetch current location" }));
  await screen.findByText(/Couldn't fetch your location/);
  fireEvent.change(screen.getByLabelText("LOCATION"), { target: { value: "Delhi" } });
  expect(screen.getByLabelText("LOCATION")).toHaveValue("Delhi");
  getCurrentPosition.mockImplementation((success) => success({ coords: { latitude: 28.6139, longitude: 77.209 } }));
  fireEvent.click(screen.getByRole("button", { name: "Fetch current location" }));
  expect(screen.getByLabelText("LOCATION")).toHaveValue("28.61390, 77.20900");
});

test("preserves premium navigation and logout through the settings button", async () => {
  setTokenInLS("test-token");
  openPage();
  await screen.findByRole("link", { name: "Edit profile" });
  expect(screen.getByRole("button", { name: /BHAKTI BHAV PREMIUM/ })).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Account settings" }));
  fireEvent.click(screen.getByRole("button", { name: "Logout" }));
  expect(await screen.findByText("Home screen")).toBeInTheDocument();
  expect(getTokenFromLS()).toBeNull();
});
