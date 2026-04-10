#!/usr/bin/env python3
"""
iOS Safari testing via AWS Device Farm.

This script creates a remote access session on a real iPhone,
opens Safari, navigates to a URL, and takes a screenshot.

Prerequisites:
- AWS CLI configured with 'device-testing' profile
- Python packages: Appium-Python-Client (pip install Appium-Python-Client)

Usage:
  python3 ios-safari-test.py https://pauseai.info
  python3 ios-safari-test.py https://deploy-preview-123--pauseai.netlify.app
"""

import subprocess
import json
import time
import sys
import os
from datetime import datetime

# Configuration
AWS_PROFILE = "device-testing"
AWS_REGION = "us-west-2"
PROJECT_ARN = "arn:aws:devicefarm:us-west-2:719154425282:project:90543977-2e57-450b-85df-d0b37b669d6f"
# iPhone 13 with iOS 16.0.2
DEVICE_ARN = "arn:aws:devicefarm:us-west-2::device:8FB0AFF9C23241A0BBE046EDA21DC58F"


def run_aws_command(args: list) -> dict:
    """Run an AWS CLI command and return JSON result."""
    cmd = ["aws"] + args + ["--region", AWS_REGION, "--profile", AWS_PROFILE, "--output", "json"]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise Exception(f"AWS command failed: {result.stderr}")
    return json.loads(result.stdout)


def create_session() -> str:
    """Create a new remote access session and return its ARN."""
    print("Creating Device Farm session...")
    result = run_aws_command([
        "devicefarm", "create-remote-access-session",
        "--project-arn", PROJECT_ARN,
        "--device-arn", DEVICE_ARN,
        "--name", f"ios-test-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
    ])
    return result["remoteAccessSession"]["arn"]


def wait_for_session(session_arn: str, timeout: int = 120) -> str:
    """Wait for session to be running and return the Appium endpoint."""
    print("Waiting for session to be ready...")
    start = time.time()
    while time.time() - start < timeout:
        result = run_aws_command([
            "devicefarm", "get-remote-access-session",
            "--arn", session_arn
        ])
        status = result["remoteAccessSession"]["status"]
        print(f"  Status: {status}")
        if status == "RUNNING":
            return result["remoteAccessSession"]["endpoints"]["remoteDriverEndpoint"]
        if status in ("COMPLETED", "ERRORED"):
            raise Exception(f"Session ended unexpectedly: {status}")
        time.sleep(5)
    raise Exception("Timeout waiting for session")


def stop_session(session_arn: str):
    """Stop the remote access session."""
    print("Stopping session...")
    try:
        run_aws_command([
            "devicefarm", "stop-remote-access-session",
            "--arn", session_arn
        ])
    except Exception as e:
        print(f"Warning: Could not stop session: {e}")


def run_safari_test(endpoint: str, url: str, output_dir: str) -> dict:
    """Connect via Appium, navigate to URL, take screenshot, check for overflow."""
    from appium import webdriver
    from appium.options.common import AppiumOptions

    options = AppiumOptions()
    options.set_capability("browserName", "Safari")

    print(f"Connecting to Appium endpoint...")
    driver = webdriver.Remote(endpoint, options=options)

    try:
        print(f"Navigating to {url}...")
        driver.get(url)
        time.sleep(5)  # Wait for page to load

        title = driver.title
        current_url = driver.current_url
        print(f"Page title: {title}")
        print(f"Current URL: {current_url}")

        # Take screenshot
        timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
        screenshot_path = os.path.join(output_dir, f"ios-safari-{timestamp}.png")
        driver.save_screenshot(screenshot_path)
        print(f"Screenshot saved to {screenshot_path}")

        # Check for horizontal overflow
        doc_width = driver.execute_script("return document.documentElement.scrollWidth")
        viewport_width = driver.execute_script("return window.innerWidth")
        has_overflow = doc_width > viewport_width

        return {
            "title": title,
            "url": current_url,
            "screenshot": screenshot_path,
            "doc_width": doc_width,
            "viewport_width": viewport_width,
            "has_overflow": has_overflow
        }
    finally:
        driver.quit()


def main():
    if len(sys.argv) < 2:
        print(f"Usage: {sys.argv[0]} <url> [output_dir]")
        print(f"Example: {sys.argv[0]} https://pauseai.info ./screenshots")
        sys.exit(1)

    url = sys.argv[1]
    output_dir = sys.argv[2] if len(sys.argv) > 2 else "."

    os.makedirs(output_dir, exist_ok=True)

    session_arn = None
    try:
        session_arn = create_session()
        endpoint = wait_for_session(session_arn)
        result = run_safari_test(endpoint, url, output_dir)

        print("\n--- Results ---")
        print(f"Title: {result['title']}")
        print(f"URL: {result['url']}")
        print(f"Screenshot: {result['screenshot']}")
        print(f"Document width: {result['doc_width']}")
        print(f"Viewport width: {result['viewport_width']}")
        if result['has_overflow']:
            print("WARNING: Page has horizontal overflow!")
            sys.exit(1)
        else:
            print("OK: No horizontal overflow detected")

    finally:
        if session_arn:
            stop_session(session_arn)


if __name__ == "__main__":
    main()
