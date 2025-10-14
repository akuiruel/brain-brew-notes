from playwright.sync_api import Page, expect

def test_create_new_cheat_sheet_layout(page: Page):
    """
    This test verifies that the 'Create New Cheat Sheet' page layout
    is wide enough.
    """
    # 1. Arrange: Go to the Create New Cheat Sheet page.
    page.goto("http://127.0.0.1:8080/create")

    # 2. Assert: Confirm the main container is wide enough.
    main_container = page.locator("div.w-full.max-w-full.mx-auto")
    expect(main_container).to_be_visible()

    # 3. Screenshot: Capture the final result for visual verification.
    page.screenshot(path="jules-scratch/verification/verification.png")