import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
  getByText,
  queryAllByText,
  queryAllByRole,
} from "@testing-library/react";
import ProductAdd from "../../app/components/ProductAdd";

// Mock fetch globally
global.fetch = jest.fn();

describe("ProductAdd Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should open modal when Add Product button is clicked", async () => {
    // Mock the categories fetch that happens when modal opens
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 1, name: "test category" }],
    });

    render(<ProductAdd />);

    const addBtn = screen.getByRole("button", { name: "Add Product" });

    await act(async () => {
      fireEvent.click(addBtn);
    });

    expect(screen.getByText("Cancel")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Enter product name"),
    ).toBeInTheDocument();
  });

  test("fetches and displays categories when modal is open", async () => {
    // mock fetch categories when modal opens
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: 1, name: "category 1" },
        { id: 2, name: "category 2" },
      ],
    });
    render(<ProductAdd />);
    const addPdt = screen.getByRole("button", { name: "Add Product" });

    await act(async () => {
      fireEvent.click(addPdt);
    });

    const category1 = await screen.findByText("category 1");
    const category2 = await screen.findByText("category 2");
    expect(category1).toBeInTheDocument();
    expect(category2).toBeInTheDocument();

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith("/api/categories");
  });

  test("should display error when submitting empty form", async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { id: 1, name: "category 1" },
          { id: 2, name: "category 2" },
        ],
      })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "Please fill in all required field" }),
      });
    render(<ProductAdd />);

    const addPrd = screen.getByRole("button", { name: "Add Product" });

    await act(async () => {
      fireEvent.click(addPrd);
    });

    const nameInput = screen.getByPlaceholderText("Enter product name");
    const descriptionInput = screen.getByPlaceholderText("Enter description");

    fireEvent.change(nameInput, "  ");
    fireEvent.change(descriptionInput, "  ");
    expect(
      screen.queryByRole("img", { name: "Preview" }),
    ).not.toBeInTheDocument();

    const addProduct = screen.getAllByRole("button", { name: "Add Product" });
    const btn = addProduct[1];

    await act(async () => {
      fireEvent.click(btn);
    });

    expect(
      await screen.findByText("Please fill in all required field"),
    ).toBeInTheDocument();
  });

  test("should successfully add product and call callback", async () => {
    const mockOnAddProduct = jest.fn();
    const mockProduct = {
      id: 1,
      name: "product",
      description: "description",
      categoryId: 1,
      category: { id: 1, name: "category 1" },
    };
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { id: 1, name: "category 1" },
          { id: 2, name: "category 2" },
        ],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockProduct,
      });

    render(<ProductAdd onAddProduct={mockOnAddProduct} />);

    const addProduct = screen.getByRole("button", { name: "Add Product" });
    await act(async () => {
      fireEvent.click(addProduct);
    });

    const nameInput = screen.getByPlaceholderText("Enter product name");
    const descriptionInput = screen.getByPlaceholderText("Enter description");

    await act(async () => {
      fireEvent.change(nameInput, "product");
      fireEvent.change(descriptionInput, "description");

      const categorySelect = screen.getByRole("combobox");
      fireEvent.change(categorySelect, { target: { value: "1" } });
    });

    const addBtn = screen.queryAllByRole("button", { name: "Add Product" });
    await act(async () => {
      fireEvent.click(addBtn[1]);
    });

    await waitFor(() => {
      expect(mockOnAddProduct).toHaveBeenCalledWith(mockProduct);
    });
  });

  test("should close modal and clear form when Cancel is clicked", async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { id: 1, name: "category 1" },
          { id: 2, name: "category 2" },
        ],
      })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "Please fill in all required field" }),
      });
    render(<ProductAdd />);

    // open modal
    const addBtn = screen.getByRole("button", { name: "Add Product" });
    await act(async () => {
      fireEvent.click(addBtn);
    });

    // enter name value
    const nameInput = screen.getByPlaceholderText("Enter product name");
    fireEvent.change(nameInput, "mm");

    // close modal
    const closeBtn = screen.getByRole("button", { name: "Cancel" });
    await act(async () => {
      fireEvent.click(closeBtn);
    });

    await waitFor(() => {});
    expect(
      screen.queryByRole("heading", { name: /add product/i }),
    ).not.toBeInTheDocument();
    expect(nameInput).toHaveValue("");
  });

});
