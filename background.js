// Background script for the Bulk Email Chrome Extension

chrome.runtime.onInstalled.addListener(() => {
  console.log('🚀 Bulk Email Sender extension installed');
  console.log('💻 Developed by Mihilayan Sachinthana (KGMS)');
  console.log('📧 Ready to send bulk emails through Gmail and Outlook');
  
  // Set up default settings
  chrome.storage.local.set({
    bulkEmailData: {
      subject: '',
      message: '',
      emailList: '',
      delay: 2,
      emailProvider: 'gmail',
      ccSelf: false
    }
  });
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  // This will open the popup, no additional action needed
  console.log('Extension icon clicked');
});

// Listen for messages from popup and content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'checkEmailProvider') {
    // Check if current tab is on supported email provider
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      const currentTab = tabs[0];
      let provider = null;
      
      if (currentTab.url.includes('mail.google.com')) {
        provider = 'gmail';
      } else if (currentTab.url.includes('outlook.live.com') || currentTab.url.includes('outlook.office.com')) {
        provider = 'outlook';
      }
      
      sendResponse({provider: provider, url: currentTab.url});
    });
    
    return true; // Will respond asynchronously
  }
  
  if (request.action === 'openEmailProvider') {
    const url = request.provider === 'gmail' ? 'https://mail.google.com' : 'https://outlook.live.com';
    chrome.tabs.create({url: url});
    sendResponse({success: true});
  }
  
  if (request.action === 'logActivity') {
    console.log('Bulk Email Activity:', request.data);
  }
});

// Handle tab updates to check if user navigates to email providers
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    if (tab.url.includes('mail.google.com') || 
        tab.url.includes('outlook.live.com') || 
        tab.url.includes('outlook.office.com')) {
      
      // Inject content script if needed
      chrome.scripting.executeScript({
        target: {tabId: tabId},
        files: ['content.js']
      }).catch(err => {
        // Content script might already be injected
        console.log('Content script injection skipped:', err.message);
      });
    }
  }
});

// Storage change listener for debugging
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.bulkEmailData) {
    console.log('Bulk email data updated:', changes.bulkEmailData.newValue);
  }
});

// Handle extension updates
chrome.runtime.onUpdateAvailable.addListener((details) => {
  console.log('Extension update available:', details.version);
});

// Clean up on extension suspension
chrome.runtime.onSuspend.addListener(() => {
  console.log('Bulk Email Sender extension suspended');
});

// Error handling
chrome.runtime.onStartup.addListener(() => {
  console.log('Bulk Email Sender extension started');
});

// Utility function to validate email addresses
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Export utility function for content scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { isValidEmail };
}