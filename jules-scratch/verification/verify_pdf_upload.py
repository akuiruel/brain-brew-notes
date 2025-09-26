import asyncio
from playwright.async_api import async_playwright, expect

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        try:
            # Navigate to the application
            await page.goto("http://localhost:8080/")

            # Click the button to navigate to the create page
            await page.get_by_role("link", name="Create New").click()
            await page.wait_for_url("http://localhost:8080/create")

            # Fill in the title
            await page.get_by_label("Title").fill("Test PDF Cheat Sheet")

            # Select a category
            await page.get_by_role("combobox").click()
            await page.get_by_role("option", name="Study").click()

            # Upload the PDF file
            async with page.expect_file_chooser() as fc_info:
                await page.get_by_role("button", name="Add PDF").click()

            file_chooser = await fc_info.value
            await file_chooser.set_files("jules-scratch/verification/dummy.pdf")

            # Wait for the loading indicator to appear and then disappear
            await expect(page.get_by_text("Saving...")).to_be_visible(timeout=5000)
            await expect(page.get_by_text("Saving...")).to_be_hidden(timeout=20000)

            # Now, check if the PDF preview has been rendered
            await expect(page.get_by_text("PDF Preview")).to_be_visible()

            # Take a screenshot
            await page.screenshot(path="jules-scratch/verification/verification.png")

        except Exception as e:
            print(f"An error occurred: {e}")
            await page.screenshot(path="jules-scratch/verification/error.png")
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())