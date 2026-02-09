import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import CategoryUpdate from "../../app/components/CategoryUpdate";
import "@testing-library/jest-dom";

global.fetch = jest.fn();

describe("CategoryUpdate Component", () => {
  const mockUpdateCategories = jest.fn();
  const defaultProps = {
    CategoryId: 1,
    CategoryName: "Electronics",
    updateCategories: mockUpdateCategories,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should display current category name in input when opened", () => {
    render(<CategoryUpdate {...defaultProps} />);

    // open modal
    const editBtn = screen.getByRole("button", { name: /edit/i });
    fireEvent.click(editBtn);

    const input = screen.getByPlaceholderText(/enter category name/i);
    expect(input).toHaveValue("Electronics");
  });

  test("should show error when trying to update with duplicate name", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "This category already exist" }),
    });
    render(<CategoryUpdate {...defaultProps} />);

    const editBtn = screen.getByRole("button", { name: "Edit" });
    fireEvent.click(editBtn);

    const input = screen.getByPlaceholderText(/enter category name/i);
    fireEvent.change(input, "Electronics");

    const updateBtn = screen.getByRole("button", { name: "Update Category" });
    fireEvent.click(updateBtn);

    await waitFor(() => {
      expect(
        screen.getByText("This category already exist"),
      ).toBeInTheDocument();
    });
  });

  test('should successfully update category', async () => {
    const mockCategory = {
        id: 1,
        name: 'phones'
    };
    (global.fetch as jest.Mock)
    .mockResolvedValueOnce({
        ok: true,
        json: async () => mockCategory
    })
    render(<CategoryUpdate {...defaultProps}/>)

    const editBtn = screen.getByRole("button", { name: "Edit" });
    fireEvent.click(editBtn);

    const input = screen.getByPlaceholderText(/enter category name/i);
    fireEvent.change(input, { target: {value: "phones"}});

    const updateBtn = screen.getByRole("button", { name: "Update Category" });
    fireEvent.click(updateBtn);

    await waitFor(() => {
      expect(
        mockUpdateCategories
      ).toHaveBeenCalledWith(1, 'phones');
    });
  })

  test('should clear error when reopening modal', async () => {
  // Mock error response first
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: false,
    json: async () => ({ error: 'This category already exist' }),
  });

  render(<CategoryUpdate {...defaultProps} />);
  
  // Open modal
  const editBtn = screen.getByRole("button", { name: "Edit" });
  fireEvent.click(editBtn);

  // Wait for modal to open
  await waitFor(() => {
    expect(screen.getByRole('heading', { name: /update category/i })).toBeInTheDocument();
  });

  // Try to update (will trigger error)
  const input = screen.getByPlaceholderText(/enter category name/i);
  fireEvent.change(input, { target: { value: 'Duplicate' } });
  
  const updateBtn = screen.getByRole("button", { name: "Update Category" });
  
  await act(async () => {
    fireEvent.click(updateBtn);
  });

  // Wait for error to appear
  await waitFor(() => {
    expect(screen.getByText('This category already exist')).toBeInTheDocument();
  });

  // Close modal
  const cancelBtn = screen.getByRole("button", { name: "Cancel" });
  fireEvent.click(cancelBtn);

  // Wait for modal to close
  await waitFor(() => {
    expect(screen.queryByRole('heading', { name: /update category/i })).not.toBeInTheDocument();
  });

  // Reopen modal - error should be cleared
  fireEvent.click(editBtn);

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: /update category/i })).toBeInTheDocument();
  });

  // ✅ Use queryByText instead of getByText
  expect(screen.queryByText('This category already exist')).not.toBeInTheDocument();
});
});