# AWS Device Farm iOS Safari Testing

Scripts for testing the PauseAI website on real iOS Safari devices via AWS Device Farm.

## Why?

Playwright's WebKit engine doesn't catch all iOS Safari-specific rendering issues.
For example, `margin: -20px` causing document overflow was only visible on real iOS
Safari, not Playwright WebKit (see issue #562).

## Prerequisites

1. **AWS CLI** with the `device-testing` profile configured:

   ```bash
   aws configure --profile device-testing
   # Region: us-west-2 (Device Farm only available there)
   ```

2. **Python packages**:
   ```bash
   pip install Appium-Python-Client
   ```

## Usage

Test a URL on real iPhone Safari:

```bash
python3 scripts/device-farm/ios-safari-test.py https://pauseai.info

# Test a Netlify preview:
python3 scripts/device-farm/ios-safari-test.py https://deploy-preview-123--pauseai.netlify.app

# Specify output directory for screenshots:
python3 scripts/device-farm/ios-safari-test.py https://pauseai.info ./screenshots
```

The script will:

1. Create a Device Farm session on an iPhone 13 (iOS 16)
2. Open Safari and navigate to the URL
3. Take a screenshot
4. Check for horizontal overflow (common layout bug indicator)
5. Stop the session

## Cost

- 1000 free minutes/year included
- After that: ~$0.17/minute
- Typical test: 2-3 minutes = ~$0.50

## Device Pool

Currently configured for iPhone 13 (iOS 16.0.2). To test on different devices,
modify `DEVICE_ARN` in `ios-safari-test.py`.

List available devices:

```bash
aws devicefarm list-devices --region us-west-2 --profile device-testing \
  --filters '[{"attribute":"PLATFORM","operator":"EQUALS","values":["IOS"]}]' | \
  jq '.devices[] | {name, os, arn}'
```

## Troubleshooting

**Session timeout**: Sessions auto-terminate after 5 minutes of inactivity.
The script handles this by stopping the session after each test.

**Internal error**: The Appium endpoint URL is time-sensitive. The script
fetches a fresh endpoint each time.
