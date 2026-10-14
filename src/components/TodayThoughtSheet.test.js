import React, { useState } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Footer from "./Footer";
import TodayThoughtSheet from "./TodayThoughtSheet";

jest.mock("react-router-dom", () => {
  global.TextEncoder = require("util").TextEncoder;
  global.TextDecoder = require("util").TextDecoder;
  return jest.requireActual("react-router");
}, { virtual: true });
jest.mock("../hooks/useGA4BaseParams", () => () => ({}));
jest.mock("../hooks/useGA4Tracker", () => () => ({ trackEvent: jest.fn() }));

const thought = { thought: "अपने कर्तव्यों का पालन करें, फल की चिंता किए बिना।", author: "भगवद गीता" };
function HomeThought() {
  const [open, setOpen] = useState(false);
  return <><Footer variant="homeNav" onSuvicharClick={() => setOpen(true)} />{open && <TodayThoughtSheet thought={thought} language="hinglish" onClose={() => setOpen(false)} />}</>;
}
beforeEach(() => {
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute("open", ""); };
  HTMLDialogElement.prototype.close = function () { this.removeAttribute("open"); };
  Object.defineProperty(navigator, "share", { configurable: true, value: undefined });
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: undefined });
});

test("footer opens the API thought without navigating and Close restores scrolling and focus", () => {
  render(<MemoryRouter><HomeThought /></MemoryRouter>);
  const trigger = screen.getByRole("button", { name: "Suvichar" });
  trigger.focus();
  fireEvent.click(trigger);
  expect(screen.getByRole("dialog", { name: "आज का सुविचार" })).toBeInTheDocument();
  expect(screen.getByText(thought.thought)).toBeInTheDocument();
  expect(screen.getByText(`- ${thought.author}`)).toBeInTheDocument();
  expect(document.body.style.overflow).toBe("hidden");
  fireEvent.click(screen.getByRole("button", { name: "Close" }));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(document.body.style.overflow).toBe("");
  expect(trigger).toHaveFocus();
});

test("shares the API text and attribution through the native share dialog", async () => {
  const share = jest.fn().mockResolvedValue();
  Object.defineProperty(navigator, "share", { configurable: true, value: share });
  render(<TodayThoughtSheet thought={thought} language="hinglish" onClose={jest.fn()} />);
  fireEvent.click(screen.getByRole("button", { name: "Share Now" }));
  await waitFor(() => expect(share).toHaveBeenCalledWith({ title: "आज का सुविचार", text: `आज का सुविचार\n\n${thought.thought}\n\n— ${thought.author}` }));
  await screen.findByRole("button", { name: "Share Now" });
});

test("copies the thought when native sharing is unavailable", async () => {
  const writeText = jest.fn().mockResolvedValue();
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
  render(<TodayThoughtSheet thought={{ thought: "Do your duty.", author: "Bhagavad Gita" }} language="en" onClose={jest.fn()} />);
  fireEvent.click(screen.getByRole("button", { name: "Share Now" }));
  expect(await screen.findByRole("status")).toHaveTextContent("Thought copied");
  expect(writeText).toHaveBeenCalledWith("Today's Thought\n\nDo your duty.\n\n— Bhagavad Gita");
});

test("handles missing and arriving data without inventing a thought or author", () => {
  const { rerender } = render(<TodayThoughtSheet language="en" loading onClose={jest.fn()} />);
  expect(screen.getByRole("status")).toHaveTextContent("Loading today's thought");
  expect(screen.getByRole("button", { name: "Share Now" })).toBeDisabled();
  rerender(<TodayThoughtSheet language="en" onClose={jest.fn()} />);
  expect(screen.getByRole("status")).toHaveTextContent("not available");
  rerender(<TodayThoughtSheet thought={{ thought: "<p>Live thought</p>" }} language="en" onClose={jest.fn()} />);
  expect(screen.getByText("Live thought")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Share Now" })).toBeEnabled();
  expect(screen.queryByText(/भगवद/)).not.toBeInTheDocument();
});

test("supports backdrop and Escape dismissal", () => {
  const onClose = jest.fn();
  render(<TodayThoughtSheet thought={thought} onClose={onClose} />);
  fireEvent.click(screen.getByText(thought.thought));
  expect(onClose).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("dialog"));
  expect(onClose).toHaveBeenCalledTimes(1);
  fireEvent(screen.getByRole("dialog"), new Event("cancel", { bubbles: true, cancelable: true }));
  expect(onClose).toHaveBeenCalledTimes(2);
});

test("canceling native share keeps the sheet open without an error", async () => {
  Object.defineProperty(navigator, "share", { configurable: true, value: jest.fn().mockRejectedValue({ name: "AbortError" }) });
  render(<TodayThoughtSheet thought={thought} onClose={jest.fn()} />);
  fireEvent.click(screen.getByRole("button", { name: "Share Now" }));
  await screen.findByRole("button", { name: "Share Now" });
  expect(screen.getByRole("dialog")).toBeInTheDocument();
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
});

test("other footer destinations still navigate normally", () => {
  render(<MemoryRouter><Routes><Route path="/" element={<HomeThought />} /><Route path="/rashifal" element={<p>Rashifal page</p>} /></Routes></MemoryRouter>);
  fireEvent.click(screen.getByRole("link", { name: "Rashifal" }));
  expect(screen.getByText("Rashifal page")).toBeInTheDocument();
});
