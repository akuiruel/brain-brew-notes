from playwright.sync_api import sync_playwright, expect, Page
import re

def create_cheat_sheet(page: Page, title: str):
    """
    Creates a new cheat sheet with a specific title.
    """
    print(f"Creating cheat sheet: {title}...")
    create_button = page.get_by_role("button", name="Create New")
    expect(create_button).to_be_visible()
    create_button.click()

    expect(page.get_by_role("heading", name="Create New Cheat Sheet")).to_be_visible()
    print("On create page.")

    page.locator("#title").fill(title)
    page.get_by_role("button", name="Coding Preset", exact=True).click()
    page.get_by_role("button", name="Add Text Block").click()
    page.get_by_placeholder("Enter section title").fill(f"Content for {title}")
    page.locator(".ql-editor").fill("Test content.")
    page.get_by_role("button", name="Save").click()

    # Wait for navigation back to the main page
    expect(page.get_by_text("Your Cheat Sheets")).to_be_visible(timeout=10000)

    # Add a reload to handle potential Firestore propagation delay
    print("Reloading the page to ensure data is fresh.")
    page.reload()

    # Wait for the specific sheet to appear after reload
    print(f"Waiting for '{title}' to appear on the dashboard...")
    expect(page.locator(f"div.card:has-text('{title}')")).to_be_visible(timeout=20000)
    print(f"Cheat sheet '{title}' created and visible.")


def verify_sidebar_features(page: Page):
    """
    Verifies the 'Favorites' and 'Recent' features.
    """
    print("Navigating to the application...")
    page.goto("http://127.0.0.1:8080/")

    expect(page.get_by_role("heading", name="Selamat datang di aplikasi cheat sheet")).to_be_visible(timeout=30000)
    print("Application loaded.")

    # 1. Setup: Clean up old test sheets and create new ones
    sheet_a_title = "Test Sheet A for Sidebar"
    sheet_b_title = "Test Sheet B for Sidebar"

    for title in [sheet_a_title, sheet_b_title]:
        card_locator = page.locator(f"div.card:has-text('{title}')")
        while card_locator.count() > 0:
            print(f"Cleaning up old test sheet: {title}")
            card = card_locator.first
            more_button = card.get_by_role("button").filter(has=page.locator("svg.lucide-more-vertical"))
            more_button.click()
            dialog = page.locator("div[role='alertdialog']")
            expect(dialog).to_be_visible()
            delete_button = dialog.get_by_role("button", name="Delete")
            delete_button.click()
            expect(card).not_to_be_visible(timeout=10000)

    create_cheat_sheet(page, sheet_a_title)
    create_cheat_sheet(page, sheet_b_title)

    sheet_a_card = page.locator(f"div.card:has-text('{sheet_a_title}')").first
    sheet_b_card = page.locator(f"div.card:has-text('{sheet_b_title}')").first
    expect(sheet_a_card).to_be_visible()
    expect(sheet_b_card).to_be_visible()

    # 2. Test "Recent" functionality
    print("\n--- Verifying 'Recent' Feature ---")
    print("Viewing Sheet A...")
    sheet_a_card.get_by_role("button", name="View").click()
    expect(page.get_by_role("heading", name=sheet_a_title)).to_be_visible()
    page.get_by_role("button", name="Back to Grid").click()
    expect(page.get_by_text("Your Cheat Sheets")).to_be_visible()

    print("Viewing Sheet B...")
    sheet_b_card.get_by_role("button", name="View").click()
    expect(page.get_by_role("heading", name=sheet_b_title)).to_be_visible()
    page.get_by_role("button", name="Back to Grid").click()
    expect(page.get_by_text("Your Cheat Sheets")).to_be_visible()

    print("Navigating to 'Recent' page...")
    page.get_by_role("link", name="Recent").click()
    expect(page.get_by_role("heading", name="Recently Viewed")).to_be_visible()

    # Verify order
    recent_sheets = page.locator("div.grid > .card")
    expect(recent_sheets.first).to_contain_text(sheet_b_title)
    expect(recent_sheets.nth(1)).to_contain_text(sheet_a_title)
    print("Recent sheets are in the correct order.")
    page.screenshot(path="jules-scratch/verification/recent_page.png")
    print("Screenshot of 'Recent' page taken.")

    # 3. Test "Favorites" functionality
    print("\n--- Verifying 'Favorites' Feature ---")
    page.get_by_role("link", name="Dashboard").click()
    expect(page.get_by_text("Your Cheat Sheets")).to_be_visible()

    print("Favoriting Sheet A...")
    sheet_a_card.get_by_role("button").filter(has=page.locator("svg.lucide-star")).click()
    expect(sheet_a_card.locator("svg.lucide-star")).to_have_class(re.compile(r"fill-yellow-300"))
    print("Sheet A favorited.")

    print("Navigating to 'Favorites' page...")
    page.get_by_role("link", name="Favorites").click()
    expect(page.get_by_role("heading", name="Your Favorites")).to_be_visible()

    # Verify content
    favorite_sheets = page.locator("div.grid > .card")
    expect(favorite_sheets).to_have_count(1)
    expect(favorite_sheets.first).to_contain_text(sheet_a_title)
    print("Favorites page shows the correct sheet.")
    page.screenshot(path="jules-scratch/verification/favorites_page.png")
    print("Screenshot of 'Favorites' page taken.")

    # 4. Test Un-favoriting from the Favorites page
    print("\n--- Verifying Un-favorite Feature ---")
    print("Un-favoriting Sheet A from Favorites page...")
    favorite_sheets.first.get_by_role("button").filter(has=page.locator("svg.lucide-star")).click()

    expect(page.get_by_text("No favorites yet")).to_be_visible()
    print("Favorites page is now empty, as expected.")
    page.screenshot(path="jules-scratch/verification/favorites_empty_page.png")
    print("Screenshot of empty 'Favorites' page taken.")


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_sidebar_features(page)
            print("Verification script completed successfully.")
        except Exception as e:
            print(f"An error occurred: {e}")
            page.screenshot(path="jules-scratch/verification/error.png")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    main()