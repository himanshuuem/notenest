import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App.jsx";
import { extractLabels, notesReducer, selectNotes } from "./state/notes.js";

describe("notes state", () => {
  const notes = [
    { id: "1", title: "A", body: "one #work", color: "default", pinned: true, archived: false, updatedAt: 1 },
    { id: "2", title: "B", body: "two #home", color: "default", pinned: false, archived: false, updatedAt: 2 },
    { id: "3", title: "C", body: "three", color: "default", pinned: false, archived: true, updatedAt: 3 },
  ];

  it("extracts unique lowercase labels", () => {
    expect(extractLabels("Plan #Work", "#work and #ideas, not a#tag")).toEqual(["work", "ideas"]);
  });

  it("splits pinned/others and hides archived", () => {
    const { pinned, others } = selectNotes(notes, {});
    expect(pinned.map((n) => n.id)).toEqual(["1"]);
    expect(others.map((n) => n.id)).toEqual(["2"]);
    expect(selectNotes(notes, { view: "archive" }).others.map((n) => n.id)).toEqual(["3"]);
    expect(selectNotes(notes, { label: "home" }).others.map((n) => n.id)).toEqual(["2"]);
  });

  it("ignores empty notes and restores deleted ones in place", () => {
    expect(notesReducer(notes, { type: "create", title: " ", body: "" })).toBe(notes);
    const without = notesReducer(notes, { type: "delete", id: "2" });
    expect(notesReducer(without, { type: "restore", note: notes[1], index: 1 }).map((n) => n.id)).toEqual(["1", "2", "3"]);
  });

  it("archiving unpins", () => {
    expect(notesReducer(notes, { type: "toggleArchive", id: "1" })[0]).toMatchObject({ archived: true, pinned: false });
  });
});

describe("<App />", () => {
  it("expands the create area and adds a note", async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(screen.queryByLabelText("Title")).not.toBeInTheDocument();
    await user.click(screen.getByLabelText("Take a note"));
    await user.type(screen.getByLabelText("Title"), "Call mom");
    await user.type(screen.getByLabelText("Take a note"), "Sunday evening #family");
    await user.click(screen.getByRole("button", { name: "Add note" }));
    expect(screen.getByRole("heading", { name: "Call mom" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "🏷️ family" })).toBeInTheDocument();
  });

  it("deletes with undo", async () => {
    const user = userEvent.setup();
    render(<App />);
    const groceries = screen.getByRole("heading", { name: "Groceries" }).closest("article");
    await user.click(within(groceries).getByRole("button", { name: "Delete note" }));
    expect(screen.queryByRole("heading", { name: "Groceries" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(screen.getByRole("heading", { name: "Groceries" })).toBeInTheDocument();
  });

  it("searches and filters by label", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByLabelText("Search notes"), "mango");
    expect(screen.getByRole("heading", { name: "Groceries" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Side-project ideas" })).not.toBeInTheDocument();
    await user.clear(screen.getByLabelText("Search notes"));
    await user.click(screen.getByRole("button", { name: "🏷️ ideas" }));
    expect(screen.getByText("#ideas", { selector: "strong" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Groceries" })).not.toBeInTheDocument();
  });

  it("persists notes to localStorage", async () => {
    const user = userEvent.setup();
    render(<App />);
    const ideas = screen.getByRole("heading", { name: "Side-project ideas" }).closest("article");
    await user.click(within(ideas).getByRole("button", { name: "Pin note" }));
    const saved = JSON.parse(localStorage.getItem("notenest-notes"));
    expect(saved.find((n) => n.id === "ideas").pinned).toBe(true);
  });
});
