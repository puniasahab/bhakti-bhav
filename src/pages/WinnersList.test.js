import { fireEvent, render, screen, within } from "@testing-library/react";
import WinnersList from "./WinnersList";

jest.mock("../components/Header", () => () => <header>Bhakti Bhav</header>);

test("opens with all 16 silver coin winners in order", () => {
  render(<WinnersList />);

  expect(screen.getAllByRole("tab")).toHaveLength(3);
  expect(screen.getByRole("tab", { name: /Silver Coin/ })).toHaveAttribute("aria-selected", "true");
  const rows = within(screen.getByRole("tabpanel")).getAllByRole("listitem");
  expect(rows).toHaveLength(16);
  expect(rows[0]).toHaveTextContent("1.PushpenderUttar Pradesh");
  expect(rows[15]).toHaveTextContent("16.Devansh SinghJaipur");
  expect(screen.queryByText("Ishaan Malhotra")).not.toBeInTheDocument();
});

test("switches between the complete gift hamper and subscription lists and back", () => {
  render(<WinnersList />);

  fireEvent.click(screen.getByRole("tab", { name: /Diwali Gift Hamper/ }));
  let rows = within(screen.getByRole("tabpanel")).getAllByRole("listitem");
  expect(rows).toHaveLength(70);
  expect(rows[0]).toHaveTextContent("1.Aarav SharmaMaleDelhi");
  expect(rows[69]).toHaveTextContent("70.Kanika OberoiFemaleGujarat");
  expect(screen.getAllByText("Simran Kaur")).toHaveLength(2);
  expect(screen.queryByText("Pushpender")).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole("tab", { name: /Free Subscription/ }));
  rows = within(screen.getByRole("tabpanel")).getAllByRole("listitem");
  expect(rows).toHaveLength(70);
  expect(rows[0]).toHaveTextContent("1.Abhishek MishraMaleUttar Pradesh");
  expect(rows[69]).toHaveTextContent("70.Diya MenonFemaleLakshadweep");
  expect(rows[32]).toHaveTextContent("Joseph D'Souza");
  expect(screen.queryByText("Aarav Sharma")).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole("tab", { name: /Silver Coin/ }));
  expect(screen.getAllByRole("listitem")).toHaveLength(16);
  expect(screen.getByText("Pushpender")).toBeInTheDocument();
});

test("supports arrow keys, wrapping, Home and End with matching panel labels", () => {
  render(<WinnersList />);
  const tabs = screen.getAllByRole("tab");

  for (const [from, key, to] of [
    [0, "ArrowRight", 1],
    [1, "End", 2],
    [2, "ArrowRight", 0],
    [0, "ArrowLeft", 2],
    [2, "Home", 0],
  ]) {
    fireEvent.keyDown(tabs[from], { key });
    expect(tabs[to]).toHaveFocus();
    expect(tabs[to]).toHaveAttribute("aria-selected", "true");
    expect(tabs[to]).toHaveAttribute("tabindex", "0");
    expect(tabs[from]).toHaveAttribute("tabindex", "-1");
    expect(screen.getByRole("tabpanel")).toHaveAttribute("aria-labelledby", tabs[to].id);
    expect(screen.getByRole("tabpanel")).toHaveAttribute("id", tabs[to].getAttribute("aria-controls"));
  }
});
