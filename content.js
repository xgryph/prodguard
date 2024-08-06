const BANNER_STYLE = `
  width: 100%;
  background-color: red;
  color: white;
  text-align: center;
  padding: 10px;
  font-size: 18px;
  font-weight: bold;
  box-sizing: border-box;
  position: fixed;
  left: 0;
  z-index: 1000000;
  font-family: var(--font-family-base-4om3hr, "Amazon Ember", "Helvetica Neue", Roboto, Arial, sans-serif);
`;

function createBanner(id, position, message) {
  if (document.getElementById(id)) return;

  const banner = document.createElement('div');
  banner.id = id;
  banner.style.cssText = BANNER_STYLE + `${position}: 0;`;
  banner.textContent = message;
  return banner;
}

function addWarningBanners(message) {
  // Top banner
  const topBanner = createBanner('aws-account-warning-banner-top', 'top', message);
  if (topBanner) {
    document.body.insertBefore(topBanner, document.body.firstChild);
    
    // Adjust body padding
    document.body.style.paddingTop = (parseFloat(getComputedStyle(topBanner).height) + 10) + 'px';

    // Adjust AWS navigation header
    const awsNavHeader = document.querySelector('#awsc-nav-header');
    if (awsNavHeader) {
      awsNavHeader.style.cssText = `
        top: ${topBanner.offsetHeight}px;
        position: fixed;
        width: 100%;
        z-index: 999999;
      `;
    }

    // Adjust app content margin
    const appContent = document.querySelector('#app');
    if (appContent) {
      appContent.style.marginTop = '55px';
    }

    const sideNav = document.getElementById('app')?.querySelector('nav')?.parentElement;
    if (sideNav) {
      sideNav.style.marginTop = '105px';
    }
  }

  // Bottom banner
  const bottomBanner = createBanner('aws-account-warning-banner-bottom', 'bottom', message);
  if (bottomBanner) {
    document.body.appendChild(bottomBanner);
  }
}

function checkAccountNumber() {
  const headerElement = document.querySelector('header');
  if (!headerElement) return;

  const accountNumberSpan = Array.from(headerElement.querySelectorAll('span'))
    .find(span => /^\d{4}-\d{4}-\d{4}$/.test(span.textContent.trim()));

  if (accountNumberSpan) {
    const accountNumber = accountNumberSpan.textContent.trim();
    
    chrome.storage.sync.get(['accountNumbers', 'warningMessage'], function(result) {
      const watchList = result.accountNumbers ? result.accountNumbers.split('\n') : [];
      const message = result.warningMessage || 'WARNING: You are on a production AWS account!';
      
      if (watchList.includes(accountNumber)) {
        addWarningBanners(message);
      }
    });
  }
}

// Create a MutationObserver to watch for changes in the DOM
const observer = new MutationObserver(checkAccountNumber);

// Start observing the document with the configured parameters
observer.observe(document.body, { childList: true, subtree: true });

// Also run the check immediately in case the elements are already present
checkAccountNumber();