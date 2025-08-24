# Bulk Email Sender Chrome Extension

A powerful Chrome extension that allows you to send bulk emails directly through Gmail or Outlook web interfaces.

## Features

- ✅ **Multiple Email Providers**: Supports Gmail and Outlook
- ✅ **Bulk Email Sending**: Send personalized emails to multiple recipients
- ✅ **Progress Tracking**: Real-time progress bar and status updates
- ✅ **Customizable Delays**: Set delays between emails to avoid rate limiting
- ✅ **Auto-save**: Automatically saves your draft content
- ✅ **Modern UI**: Beautiful, responsive interface with animations
- ✅ **Email Validation**: Validates email addresses before sending
- ✅ **CC Option**: Option to CC yourself on all emails
- ✅ **Stop/Resume**: Ability to stop sending at any time

## Installation

1. **Download the Extension Files**
   - Save all the files in a folder named `bulk-email-extension`

2. **Create Icons** (Optional)
   - Create icon files: `icon16.png`, `icon32.png`, `icon48.png`, `icon128.png`
   - Or use placeholder icons for testing

3. **Load Extension in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked"
   - Select the `bulk-email-extension` folder
   - The extension will appear in your extensions list

## File Structure

```
bulk-email-extension/
├── manifest.json          # Extension configuration
├── popup.html             # Extension popup interface
├── popup.js              # Popup functionality
├── content.js            # Content script for email automation
├── background.js         # Background service worker
├── icon16.png           # Extension icon 16x16
├── icon32.png           # Extension icon 32x32
├── icon48.png           # Extension icon 48x48
├── icon128.png          # Extension icon 128x128
└── README.md            # This file
```

## Usage

1. **Navigate to Your Email Provider**
   - Go to Gmail: `https://mail.google.com`
   - Or Outlook: `https://outlook.live.com`
   - Make sure you're logged in

2. **Open the Extension**
   - Click the extension icon in your Chrome toolbar
   - The popup window will appear

3. **Configure Your Email**
   - Select your email provider (Gmail/Outlook)
   - Enter the subject line
   - Write your message
   - Add email addresses (one per line)

4. **Advanced Settings** (Click the ⚙️ icon)
   - Set delay between emails (1-60 seconds)
   - Enable CC to yourself option

5. **Send Emails**
   - Click "Send Bulk Emails"
   - Monitor progress in real-time
   - Use "Stop Sending" to halt the process if needed

## Important Notes

### Rate Limiting
- Gmail: Recommended delay of 2+ seconds between emails
- Outlook: Recommended delay of 3+ seconds between emails
- Higher delays reduce the risk of being flagged as spam

### Best Practices
- Test with a small batch first
- Use professional, non-spammy content
- Respect recipients' privacy and consent
- Don't send unsolicited emails
- Consider using proper email marketing services for large campaigns

### Limitations
- Requires manual login to email provider
- Subject to email provider's sending limits
- May not work with 2FA-protected accounts in some cases
- Browser must remain open during sending

## Troubleshooting

### Extension Not Working
1. Refresh the email provider page
2. Make sure you're logged into your email account
3. Check browser console for errors (F12)
4. Reload the extension in `chrome://extensions/`

### Emails Not Sending
1. Verify you're on the correct email provider website
2. Check that compose button is visible on the page
3. Ensure email addresses are properly formatted
4. Try increasing the delay between emails

### Common Issues
- **"Compose button not found"**: Refresh the Gmail/Outlook page
- **"Recipient field not found"**: Make sure the compose window opened properly
- **Emails stuck in drafts**: Check your internet connection and try again

## Technical Details

### Permissions
- `storage`: Save user preferences and email drafts
- `activeTab`: Interact with the current browser tab
- `host_permissions`: Access Gmail and Outlook websites

### Browser Support
- Chrome 88+
- Chromium-based browsers (Edge, Brave, etc.)

### Security
- No data is sent to external servers
- All processing happens locally in your browser
- Email credentials are never stored or transmitted

## Development

### Adding New Email Providers
1. Add host permissions in `manifest.json`
2. Implement provider-specific selectors in `content.js`
3. Add provider option in `popup.html`
4. Test thoroughly with the new provider

### Customization
- Modify `popup.html` and CSS for UI changes
- Update `content.js` for email provider compatibility
- Adjust delays and limits in `popup.js`

## Support

For issues or feature requests:
1. Check the troubleshooting section above
2. Inspect browser console for detailed error messages
3. Test with different email providers or accounts

## Legal Disclaimer

This extension is for legitimate bulk email purposes only. Users are responsible for:
- Complying with anti-spam laws (CAN-SPAM, GDPR, etc.)
- Obtaining proper consent from email recipients
- Following email provider terms of service
- Not using the extension for malicious purposes

Use responsibly and ethically!
