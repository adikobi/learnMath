import asyncio
from playwright.async_api import async_playwright, expect
import os

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        # Get the absolute path to the index.html file
        file_path = os.path.abspath('index.html')

        # Go to the local HTML file
        await page.goto(f'file://{file_path}')

        # Wait for the player selection screen to be visible
        await expect(page.get_by_text("🎮 בחר שחקן 🎮")).to_be_visible()

        # Take a screenshot of the player selection screen
        await page.screenshot(path="jules-scratch/verification/01_player_selection.png")

        # Click on the first player
        await page.get_by_alt_text("מעין").click()

        # Wait for the next stage to be visible
        await expect(page.get_by_text("🔍 מצא את המספר 🔍")).to_be_visible()

        # Check if the new instruction text is present
        await expect(page.get_by_text("הקשיבו למספר, ואז לחצו על התמונה המתאימה.")).to_be_visible()

        # Take a screenshot of the number finding stage
        await page.screenshot(path="jules-scratch/verification/02_number_finding.png")

        await browser.close()

if __name__ == '__main__':
    asyncio.run(main())
