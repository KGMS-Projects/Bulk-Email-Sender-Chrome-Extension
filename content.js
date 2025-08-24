// Content script for Gmail and Outlook email sending
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'sendEmail') {
    const provider = request.data.provider;
    
    if (provider === 'gmail') {
      sendGmailEmail(request.data)
        .then(() => sendResponse({success: true}))
        .catch(error => sendResponse({success: false, error: error.message}));
    } else if (provider === 'outlook') {
      sendOutlookEmail(request.data)
        .then(() => sendResponse({success: true}))
        .catch(error => sendResponse({success: false, error: error.message}));
    }
    
    return true; // Will respond asynchronously
  }
});

async function sendGmailEmail(emailData) {
  return new Promise((resolve, reject) => {
    try {
      console.log('Starting Gmail email send process...');
      
      // First, check if compose window is already open
      const existingCompose = document.querySelector('div[role="dialog"][aria-label*="compose"]') ||
                             document.querySelector('.nH.aHU') ||
                             document.querySelector('.nH.Hd');
      
      if (existingCompose) {
        console.log('Compose window already open, using existing window...');
        fillEmailForm(emailData, resolve, reject);
        return;
      }
      
      // Multiple selectors for Gmail compose button
      let composeButton = document.querySelector('[gh="cm"]') || 
                         document.querySelector('div[role="button"][gh="cm"]') ||
                         document.querySelector('div[data-tooltip*="Compose"]') ||
                         document.querySelector('.T-I.T-I-KE.L3') ||
                         document.querySelector('[data-tooltip="Compose"]') ||
                         document.querySelector('div[aria-label*="Compose"]');
      
      if (!composeButton) {
        // Try finding by text content
        const buttons = document.querySelectorAll('div[role="button"], button, span[role="button"]');
        for (let btn of buttons) {
          const text = btn.textContent.toLowerCase().trim();
          const ariaLabel = (btn.getAttribute('aria-label') || '').toLowerCase();
          if (text.includes('compose') || ariaLabel.includes('compose')) {
            composeButton = btn;
            console.log('Found compose button by text:', text);
            break;
          }
        }
      }
      
      if (!composeButton) {
        console.error('Available buttons:', document.querySelectorAll('div[role="button"], button'));
        reject(new Error('Compose button not found. Make sure you are on Gmail and the page is fully loaded.'));
        return;
      }
      
      console.log('Found compose button, clicking...');
      composeButton.click();
      
      // Wait longer for compose window to open and handle duplicates
      setTimeout(() => {
        fillEmailForm(emailData, resolve, reject);
      }, 2000); // Increased wait time
      
    } catch (error) {
      reject(error);
    }
  });
}

function fillEmailForm(emailData, resolve, reject) {
  try {
    console.log('Looking for compose fields...');
    
    // Find recipient field with more selectors
    const toField = document.querySelector('input[name="to"]') ||
                   document.querySelector('textarea[name="to"]') ||
                   document.querySelector('div[aria-label*="To"] input') ||
                   document.querySelector('div[aria-label*="To"] textarea') ||
                   document.querySelector('input[aria-label*="recipients"]') ||
                   document.querySelector('textarea[aria-label*="recipients"]') ||
                   document.querySelector('[peoplekit-id="BbVjBd"]') ||
                   document.querySelector('div[contenteditable="true"][aria-label*="To"]');
    
    if (!toField) {
      console.error('Available input fields:', document.querySelectorAll('input, textarea'));
      reject(new Error('Recipient field not found. The compose window may not have opened properly.'));
      return;
    }
    
    console.log('Found recipient field, filling...');
    
    // Focus and clear the field
    toField.focus();
    if (toField.value !== undefined) {
      toField.value = '';
    } else {
      toField.textContent = '';
    }
    
    // Set email address
    if (toField.value !== undefined) {
      toField.value = emailData.to;
      toField.dispatchEvent(new Event('input', { bubbles: true }));
      toField.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      toField.textContent = emailData.to;
      toField.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    // Press Tab to confirm recipient
    toField.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', code: 'Tab', keyCode: 9 }));
    
    setTimeout(() => {
      // Find and fill subject field
      const subjectField = document.querySelector('input[name="subjectbox"]') ||
                          document.querySelector('input[aria-label*="Subject"]') ||
                          document.querySelector('input[placeholder*="Subject"]');
      
      if (subjectField) {
        subjectField.focus();
        subjectField.value = emailData.subject;
        subjectField.dispatchEvent(new Event('input', { bubbles: true }));
        console.log('Subject filled:', emailData.subject);
      }
      
      setTimeout(() => {
        // Find and fill message body
        const messageBody = document.querySelector('div[aria-label*="Message Body"]') ||
                          document.querySelector('div[contenteditable="true"]:not([aria-label*="To"]):not([aria-label*="Subject"])') ||
                          document.querySelector('div[role="textbox"]:not([aria-label*="To"])');
        
        if (messageBody) {
          messageBody.focus();
          messageBody.innerHTML = emailData.message.replace(/\n/g, '<br>');
          messageBody.dispatchEvent(new Event('input', { bubbles: true }));
          console.log('Message filled:', emailData.message);
        }
        
        setTimeout(() => {
          // Send the email
          const sendButton = document.querySelector('div[data-tooltip*="Send"]') ||
                           document.querySelector('div[aria-label*="Send"]') ||
                           document.querySelector('div[role="button"][aria-label*="Send"]') ||
                           document.querySelector('.T-I.J-J5-Ji.aoO.v7.T-I-atl.L3') ||
                           document.querySelector('div[data-tooltip="Send ‪(Ctrl+Enter)‬"]');
          
          if (sendButton) {
            console.log('Found send button, clicking...');
            sendButton.click();
            
            // Wait a bit then resolve
            setTimeout(() => {
              console.log('Email sent successfully!');
              resolve();
            }, 1500);
          } else {
            console.error('Send button not found');
            console.log('Available buttons:', document.querySelectorAll('div[role="button"], button'));
            reject(new Error('Send button not found'));
          }
        }, 1000);
        
      }, 500);
    }, 800);
    
  } catch (error) {
    reject(error);
  }
}

async function sendOutlookEmail(emailData) {
  return new Promise((resolve, reject) => {
    try {
      // Find new email button
      let newEmailButton = document.querySelector('button[aria-label*="New mail"]') ||
                          document.querySelector('button[title*="New message"]') ||
                          document.querySelector('span[title*="New message"]') ||
                          document.querySelector('button[data-app-id="Mail"]');
      
      if (!newEmailButton) {
        // Try to find by text content
        const buttons = document.querySelectorAll('button, span');
        for (let btn of buttons) {
          const text = btn.textContent.toLowerCase();
          if (text.includes('new') && (text.includes('mail') || text.includes('message'))) {
            newEmailButton = btn;
            break;
          }
        }
      }
      
      if (!newEmailButton) {
        reject(new Error('New email button not found. Make sure you are on Outlook.'));
        return;
      }
      
      newEmailButton.click();
      
      // Wait for compose window
      setTimeout(() => {
        try {
          // Find recipient field
          const toField = document.querySelector('input[aria-label*="To"]') ||
                         document.querySelector('input[placeholder*="To"]') ||
                         document.querySelector('div[aria-label*="To"] input') ||
                         document.querySelector('input[role="textbox"][aria-describedby*="to"]');
          
          if (!toField) {
            reject(new Error('To field not found'));
            return;
          }
          
          toField.focus();
          toField.value = emailData.to;
          toField.dispatchEvent(new Event('input', { bubbles: true }));
          toField.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));
          
          setTimeout(() => {
            // Find subject field
            const subjectField = document.querySelector('input[aria-label*="Subject"]') ||
                                document.querySelector('input[placeholder*="Subject"]') ||
                                document.querySelector('input[aria-label*="Add a subject"]');
            
            if (subjectField) {
              subjectField.focus();
              subjectField.value = emailData.subject;
              subjectField.dispatchEvent(new Event('input', { bubbles: true }));
            }
            
            setTimeout(() => {
              // Find message body
              const messageBody = document.querySelector('div[aria-label*="Message body"]') ||
                                document.querySelector('div[contenteditable="true"]') ||
                                document.querySelector('div[role="textbox"]:not([aria-label*="To"]):not([aria-label*="Subject"])');
              
              if (messageBody) {
                messageBody.focus();
                messageBody.innerHTML = emailData.message.replace(/\n/g, '<br>');
                messageBody.dispatchEvent(new Event('input', { bubbles: true }));
              }
              
              // Send email
              setTimeout(() => {
                const sendButton = document.querySelector('button[aria-label*="Send"]') ||
                                 document.querySelector('button[title*="Send"]') ||
                                 document.querySelector('span[title*="Send"]');
                
                if (sendButton) {
                  sendButton.click();
                  setTimeout(() => resolve(), 1000);
                } else {
                  reject(new Error('Send button not found'));
                }
              }, 1000);
              
            }, 500);
          }, 500);
          
        } catch (error) {
          reject(error);
        }
      }, 2000);
      
    } catch (error) {
      reject(error);
    }
  });
}

function typeText(element, text) {
  // Simulate natural typing
  element.focus();
  element.value = '';
  
  for (let i = 0; i < text.length; i++) {
    setTimeout(() => {
      element.value += text[i];
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }, i * 50);
  }
}

function getUserEmail() {
  // Try to extract user email from Gmail interface
  const emailElements = document.querySelectorAll('[email]');
  for (let el of emailElements) {
    const email = el.getAttribute('email');
    if (email && email.includes('@')) {
      return email;
    }
  }
  
  // Try alternative methods
  const userInfo = document.querySelector('img[aria-label*="Account Information"]');
  if (userInfo && userInfo.getAttribute('aria-label')) {
    const match = userInfo.getAttribute('aria-label').match(/[\w.-]+@[\w.-]+\.\w+/);
    if (match) return match[0];
  }
  
  return null;
}

// Add CSS for better visual feedback
const style = document.createElement('style');
style.textContent = `
  .bulk-email-highlight {
    outline: 2px solid #4285f4 !important;
    outline-offset: 2px !important;
  }
`;
document.head.appendChild(style);