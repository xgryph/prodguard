function addWarningBanners(message) {

  // Top banner
  if (!document.getElementById('aws-account-warning-banner-top')) {
    const topBanner = document.createElement('div');
    topBanner.id = 'aws-account-warning-banner-top';
    topBanner.style.cssText = `
      width: 100%;
      background-color: red;
      color: white;
      text-align: center;
      padding: 10px;
      font-size: 18px;
      font-weight: bold;
      box-sizing: border-box;
      position: fixed;
      top: 0;
      left: 0;
      z-index: 1000000;
      font-family: var(--font-family-base-4om3hr, "Amazon Ember", "Helvetica Neue", Roboto, Arial, sans-serif);
    `;
    topBanner.textContent = message;

    // Insert the banner at the top of the body
    document.body.insertBefore(topBanner, document.body.firstChild);

    // Add padding to the top of the body to prevent content from being hidden
    document.body.style.paddingTop = 
      (parseFloat(getComputedStyle(topBanner).height) + 10) + 'px';

    // Adjust the position of the AWS navigation header
    const awsNavHeader = document.querySelector('#awsc-nav-header');
    if (awsNavHeader) {
      awsNavHeader.style.top = topBanner.offsetHeight + 'px';
      awsNavHeader.style.position = 'fixed';
      awsNavHeader.style.width = '100%';
      awsNavHeader.style.zIndex = '999999';
    }

    // Adjust margin-top for the app content
    const appContent = document.querySelector('#app');
    if (appContent) {
      appContent.style.marginTop =  '35px';
    }
  }

  // Bottom banner (unchanged)
  if (!document.getElementById('aws-account-warning-banner-bottom')) {
    const bottomBanner = document.createElement('div');
    bottomBanner.id = 'aws-account-warning-banner-bottom';
    bottomBanner.style.cssText = `
      position: fixed;
      bottom: 0;
      left: 0;
      width: 100%;
      background-color: red;
      color: white;
      text-align: center;
      padding: 10px;
      font-size: 18px;
      font-weight: bold;
      z-index: 1000000;
      font-family: var(--font-family-base-4om3hr, "Amazon Ember", "Helvetica Neue", Roboto, Arial, sans-serif);
    `;
    bottomBanner.textContent = message;
    document.body.appendChild(bottomBanner);

  }
}

function checkAccountNumber() {
  const headerElement = document.querySelector('header');
  if (headerElement) {
    const spanElements = headerElement.querySelectorAll('span');
    const accountNumberRegex = /^\d{4}-\d{4}-\d{4}$/;

    for (const spanElement of spanElements) {
      const content = spanElement.textContent.trim();
      if (accountNumberRegex.test(content)) {
        const accountNumber = content;
        
        chrome.storage.sync.get(['accountNumbers', 'warningMessage'], function(result) {
          const watchList = result.accountNumbers ? result.accountNumbers.split('\n') : [];
	  const message = result.warningMessage || 'WARNING: You are on a production AWS account!';          
          if (watchList.includes(accountNumber)) {
            addWarningBanners(message);
          }
        });
        
        return; // Exit the function once we've found the account number span
      }
    }
  }
}


// Create a MutationObserver to watch for changes in the DOM
const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (mutation.type === 'childList') {
      checkAccountNumber();
    }
  }
});

// Start observing the document with the configured parameters
observer.observe(document.body, { childList: true, subtree: true });

// Also run the check immediately in case the elements are already present
checkAccountNumber();
