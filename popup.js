let isSending = false;
let emailQueue = [];
let currentIndex = 0;

document.addEventListener('DOMContentLoaded', function() {
  loadSavedData();
  setupEventListeners();
});

function setupEventListeners() {
  document.getElementById('sendEmails').addEventListener('click', startSending);
  document.getElementById('stopSending').addEventListener('click', stopSending);
  document.getElementById('settingsToggle').addEventListener('click', toggleSettings);
  
  // Save data on input
  ['subject', 'message', 'emailList', 'delay', 'emailProvider'].forEach(id => {
    document.getElementById(id).addEventListener('input', saveData);
  });
  
  document.getElementById('ccSelf').addEventListener('change', saveData);
}

function toggleSettings() {
  const settings = document.getElementById('advancedSettings');
  settings.style.display = settings.style.display === 'none' ? 'block' : 'none';
}

function loadSavedData() {
  chrome.storage.local.get(['bulkEmailData'], function(result) {
    if (result.bulkEmailData) {
      const data = result.bulkEmailData;
      document.getElementById('subject').value = data.subject || '';
      document.getElementById('message').value = data.message || '';
      document.getElementById('emailList').value = data.emailList || '';
      document.getElementById('delay').value = data.delay || 2;
      document.getElementById('emailProvider').value = data.emailProvider || 'gmail';
      document.getElementById('ccSelf').checked = data.ccSelf || false;
    }
  });
}

function saveData() {
  const data = {
    subject: document.getElementById('subject').value,
    message: document.getElementById('message').value,
    emailList: document.getElementById('emailList').value,
    delay: document.getElementById('delay').value,
    emailProvider: document.getElementById('emailProvider').value,
    ccSelf: document.getElementById('ccSelf').checked
  };
  
  chrome.storage.local.set({bulkEmailData: data});
}

function validateInputs() {
  const subject = document.getElementById('subject').value.trim();
  const message = document.getElementById('message').value.trim();
  const emailListText = document.getElementById('emailList').value.trim();
  
  if (!subject) {
    showStatus('Please enter a subject', 'error');
    return false;
  }
  
  if (!message) {
    showStatus('Please enter a message', 'error');
    return false;
  }
  
  if (!emailListText) {
    showStatus('Please enter at least one email address', 'error');
    return false;
  }
  
  const emails = emailListText.split('\n').filter(email => email.trim());
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  for (let email of emails) {
    if (!emailRegex.test(email.trim())) {
      showStatus(`Invalid email address: ${email}`, 'error');
      return false;
    }
  }
  
  return true;
}

async function startSending() {
  if (!validateInputs()) return;
  
  console.log('Validation passed, checking tab...');
  
  // Check if user is on the correct email provider page
  try {
    const tabs = await chrome.tabs.query({active: true, currentWindow: true});
    const currentTab = tabs[0];
    const provider = document.getElementById('emailProvider').value;
    
    console.log('Current tab URL:', currentTab.url);
    console.log('Selected provider:', provider);
    
    let correctSite = false;
    if (provider === 'gmail' && currentTab.url.includes('mail.google.com')) {
      correctSite = true;
    } else if (provider === 'outlook' && (currentTab.url.includes('outlook.live.com') || currentTab.url.includes('outlook.office.com'))) {
      correctSite = true;
    }
    
    if (!correctSite) {
      const siteUrl = provider === 'gmail' ? 'https://mail.google.com' : 'https://outlook.live.com';
      showStatus(`Please navigate to ${siteUrl} first and make sure you're logged in`, 'error');
      return;
    }
    
    console.log('Site check passed, starting send process...');
    
    isSending = true;
    currentIndex = 0;
    
    const emailListText = document.getElementById('emailList').value.trim();
    emailQueue = emailListText.split('\n').filter(email => email.trim()).map(email => email.trim());
    
    console.log('Email queue:', emailQueue);
    
    document.getElementById('sendEmails').style.display = 'none';
    document.getElementById('stopSending').style.display = 'block';
    document.getElementById('progressBar').style.display = 'block';
    
    showStatus(`Starting to send ${emailQueue.length} emails...`, 'info');
    
    await sendNextEmail();
  } catch (error) {
    console.error('Error in startSending:', error);
    showStatus('Error: ' + error.message, 'error');
    stopSending();
  }
}

function stopSending() {
  isSending = false;
  document.getElementById('sendEmails').style.display = 'block';
  document.getElementById('stopSending').style.display = 'none';
  document.getElementById('progressBar').style.display = 'none';
  showStatus('Sending stopped', 'info');
}

async function sendNextEmail() {
  if (!isSending || currentIndex >= emailQueue.length) {
    if (currentIndex >= emailQueue.length) {
      showStatus(`All ${emailQueue.length} emails sent successfully!`, 'success');
    }
    stopSending();
    return;
  }
  
  const currentEmail = emailQueue[currentIndex];
  const progress = ((currentIndex + 1) / emailQueue.length) * 100;
  
  document.getElementById('progressFill').style.width = progress + '%';
  showStatus(`Sending email ${currentIndex + 1} of ${emailQueue.length} to ${currentEmail}`, 'info');
  
  const emailData = {
    to: currentEmail,
    subject: document.getElementById('subject').value,
    message: document.getElementById('message').value,
    provider: document.getElementById('emailProvider').value,
    ccSelf: document.getElementById('ccSelf').checked
  };
  
  try {
    console.log('Attempting to send email to:', currentEmail);
    
    // Send message to content script
    const tabs = await chrome.tabs.query({active: true, currentWindow: true});
    
    const response = await new Promise((resolve, reject) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'sendEmail',
        data: emailData
      }, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(response);
        }
      });
    });
    
    if (response && response.success) {
      console.log('Email sent successfully to:', currentEmail);
      currentIndex++;
      
      // Wait for the specified delay before sending next email
      const delay = parseInt(document.getElementById('delay').value) * 1000;
      setTimeout(sendNextEmail, delay);
    } else {
      throw new Error(response ? response.error : 'Unknown error occurred');
    }
    
  } catch (error) {
    console.error('Error sending email:', error);
    showStatus(`Error sending email to ${currentEmail}: ${error.message}`, 'error');
    
    // Ask user if they want to continue
    setTimeout(() => {
      if (confirm(`Error sending to ${currentEmail}. Continue with next email?`)) {
        currentIndex++;
        setTimeout(sendNextEmail, 2000);
      } else {
        stopSending();
      }
    }, 1000);
  }
}

function showStatus(message, type) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.className = `status ${type}`;
  status.style.display = 'block';
  
  if (type === 'success' || type === 'error') {
    setTimeout(() => {
      status.style.display = 'none';
    }, 5000);
  }
}