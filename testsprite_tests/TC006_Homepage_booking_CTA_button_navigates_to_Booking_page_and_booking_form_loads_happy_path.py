import asyncio
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None

    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()

        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",         # Set the browser window size
                "--disable-dev-shm-usage",        # Avoid using /dev/shm which can cause issues in containers
                "--ipc=host",                     # Use host-level IPC for better stability
                "--single-process"                # Run the browser in a single process mode
            ],
        )

        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        context.set_default_timeout(5000)

        # Open a new page in the browser context
        page = await context.new_page()

        # Interact with the page elements to simulate user flow
        # -> Navigate to http://localhost:4173
        await page.goto("http://localhost:4173")
        
        # -> Click 'Tümünü Kabul Et' (cookie accept) to dismiss the cookie banner, then click 'Giriş Yap' to open the login page.
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/div/div/div/div/div/div[2]/button').nth(0)
        await asyncio.sleep(3); await elem.click()
        
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/div/div/header/div/div/nav/div/a[2]').nth(0)
        await asyncio.sleep(3); await elem.click()
        
        # -> Fill the login form with example@gmail.com / password123 and submit the form to authenticate.
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=/html/body/div/div/div/div/div/form/div/div/input').nth(0)
        await asyncio.sleep(3); await elem.fill('example@gmail.com')
        
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=/html/body/div/div/div/div/div/form/div[2]/div/input').nth(0)
        await asyncio.sleep(3); await elem.fill('password123')
        
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/div/div/div/div/div/form/button').nth(0)
        await asyncio.sleep(3); await elem.click()
        
        # -> Click the 'Ana Sayfaya Dön' link (index 464) to go to the homepage so the booking CTA can be located and clicked.
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/div/div/div/div/div/div[3]/a').nth(0)
        await asyncio.sleep(3); await elem.click()
        
        # -> Click the hero booking CTA ('Randevu Al', index 641) to navigate to the Booking page and then wait for the page to load.
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/div/div/main/div/section/div[2]/div/div/a').nth(0)
        await asyncio.sleep(3); await elem.click()
        
        # --> Assertions to verify final state
        frame = context.pages[-1]
        assert await frame.locator("xpath=//*[contains(., 'Randevu Al')]").nth(0).is_visible(), "Expected 'Randevu Al' to be visible"
        current_url = await frame.evaluate("() => window.location.href")
        assert '/booking' in current_url
        assert await frame.locator("xpath=//*[contains(., 'Randevu')]").nth(0).is_visible(), "Expected 'Randevu' to be visible"
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    