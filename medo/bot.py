import sys
import os

# Force unbuffered output immediately
sys.stdout.reconfigure(line_buffering=True)
print("LOG:INFO:Initializing Python Environment...")

import asyncio
import argparse
import random
import string
import sys
import re
import os
from playwright.async_api import async_playwright

# Force unbuffered output for real-time streaming
sys.stdout.reconfigure(line_buffering=True)

def generate_password():
    chars = string.ascii_letters + string.digits + "!@#$%^&*"
    return ''.join(random.choice(chars) for _ in range(12))

async def run_signup_flow(account_num, target_url):
    print(f"LOG:INFO:--- STARTING ACCOUNT {account_num} ---")
    async with async_playwright() as p:
        print("LOG:INFO:Launching secure browser instance...")
        try:
            browser = await p.chromium.launch(headless=True, args=["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"])
            print("LOG:SUCCESS:Browser instance active")
        except Exception as e:
            print(f"LOG:ERROR:Browser launch failed: {str(e)}")
            return

        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            viewport={"width": 1280, "height": 720}
        )
        
        # Monitor all console messages from the browser
        page = await context.new_page()
        print("LOG:INFO:Initializing automation engine...")

        try:
            # 1. TEMP MAIL
            print("LOG:INFO:Accessing TempMail.Plus for identity generation")
            await page.goto("https://tempmail.plus/en/", wait_until="domcontentloaded", timeout=60000)
            await page.wait_for_selector("#pre_button", timeout=30000)
            
            print("LOG:INFO:Refreshing email pool...")
            await page.click("#pre_rand")
            await asyncio.sleep(2)
            
            email_address = await page.input_value("#pre_button")
            domain = await page.inner_text("#domain")
            full_email = f"{email_address}{domain}"
            print(f"LOG:SUCCESS:Identity created: {full_email}")

            # 2. MEDO SIGNUP
            print(f"LOG:INFO:Navigating to target: {target_url[:40]}...")
            signup_page = await context.new_page()
            await signup_page.goto(target_url, wait_until="networkidle", timeout=60000)
            
            print("LOG:INFO:Locating authentication interface...")
            await signup_page.click("text=Login")
            await asyncio.sleep(1)
            await signup_page.click("#link-signup-login")
            
            print("LOG:INFO:Injecting credentials...")
            await signup_page.fill("#email", full_email)
            password = generate_password()
            await signup_page.fill("#password", password)
            
            try:
                await signup_page.click("#agree-terms", force=True)
                print("LOG:INFO:Terms accepted")
            except: 
                print("LOG:WARN:Terms checkbox skip (may be auto-checked)")

            print("LOG:INFO:Executing signup protocol...")
            await signup_page.click("#btn-signup")
            print("LOG:SUCCESS:Signup submitted. Waiting for processing...")
            
            # 3. VERIFICATION
            print("LOG:INFO:Monitoring inbox for verification link (timeout: 90s)...")
            email_found = False
            for i in range(18): # 90 seconds
                await page.bring_to_front()
                # Click refresh button in temp mail if available
                try: await page.click("#pre_button", timeout=1000) 
                except: pass
                
                content = await page.content()
                if "MeDo" in content or "Verify" in content:
                    print(f"LOG:SUCCESS:Verification email received at {i*5}s")
                    await page.click("text=MeDo")
                    email_found = True
                    break
                await asyncio.sleep(5)
            
            if not email_found: 
                print("LOG:ERROR:Verification email timeout")
                raise Exception("Email timeout")

            # 4. EXTRACT LINK
            print("LOG:INFO:Extracting secure verification token...")
            await asyncio.sleep(3)
            html = await page.content()
            match = re.search(r'https://auth\.medo\.dev/u/email-verification\?ticket=[^"\'\s<>]+', html)
            if match:
                verify_url = match.group(0)
                print("LOG:SUCCESS:Token extracted. Finalizing account...")
                await signup_page.bring_to_front()
                await signup_page.goto(verify_url, wait_until="networkidle")
            else:
                print("LOG:ERROR:Verification link not found in email body")
                raise Exception("Link not found")

            # 5. FINAL LOGIN
            print("LOG:INFO:Verifying active session...")
            await asyncio.sleep(5)
            await signup_page.goto("https://medo.dev", wait_until="domcontentloaded")
            await signup_page.click("text=Login")
            await signup_page.fill("#email", full_email)
            await signup_page.fill("#password", password)
            await signup_page.click("#btn-login")
            await asyncio.sleep(5)
            
            print(f"LOG:SUCCESS:ACCOUNT {account_num} VERIFIED AND READY")
            return True

        except Exception as e:
            print(f"LOG:ERROR:Sequence failed for account {account_num}: {str(e)}")
            return False
        finally:
            await browser.close()
            print(f"LOG:INFO:Browser instance {account_num} terminated")

async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--count", type=int, default=1)
    parser.add_argument("--url", type=str, required=True)
    args = parser.parse_args()

    print(f"LOG:INFO:Starting automation cluster. Target count: {args.count}")
    for i in range(1, args.count + 1):
        await run_signup_flow(i, args.url)
        if i < args.count:
            print(f"LOG:INFO:Cooldown before next instance...")
            await asyncio.sleep(3)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("LOG:WARN:Interrupted by user")
    except Exception as e:
        print(f"LOG:ERROR:System error: {e}")
