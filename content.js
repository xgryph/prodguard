/* eslint-disable eqeqeq */
/* eslint-disable no-plusplus */
/* eslint-disable no-param-reassign */
const BANNER_STYLE = `
  width: 100%;
  text-align: center;
  padding: 10px;
  font-size: 18px;
  font-weight: bold;
  box-sizing: border-box;
  position: fixed;
  left: 0;
  z-index: 1000000;
  font-family: var(--font-family-base-4om3hr, "Amazon Ember", "Helvetica Neue", Roboto, Arial, sans-serif);
  transition: bottom 0.3s ease-in-out;
`;

function createBanner(id, position, message) {
  let bannerStyle = BANNER_STYLE;

  if (document.getElementById(id)) {
    return null; // Return null if the banner already exists
  }

  if (message.meta.bgcolor) {
    bannerStyle += `background-color: ${message.meta.bgcolor};`;
  } else {
    bannerStyle += 'background-color: red;';
  }
  if (message.meta.fgcolor) {
    bannerStyle += `color: ${message.meta.fgcolor};`;
  } else {
    bannerStyle += 'color: white;';
  }

  const banner = document.createElement('div');
  banner.id = id;
  banner.style.cssText = `${bannerStyle}${position}: 0;`;
  banner.textContent = message.text;
  return banner;
}

function setupBottomBannerInteraction(banner) {
  let timeoutId;
  let isHidden = false;

  banner.addEventListener('mouseenter', () => {
    clearTimeout(timeoutId);
    if (!isHidden) {
      isHidden = true;
      banner.style.setProperty('bottom', `-${banner.offsetHeight}px`);
      timeoutId = setTimeout(() => {
        isHidden = false;
        banner.style.setProperty('bottom', '0');
      }, 5000);
    }
  });
}

function addFlickerEffect(element) {
  let isFlickering = false;

  function flicker() {
    if (isFlickering) return;

    isFlickering = true;
    let opacity = 1;
    const flickerInterval = setInterval(() => {
      opacity = opacity === 1 ? 0.3 : 1;
      element.style.opacity = opacity;
    }, 100);

    setTimeout(() => {
      clearInterval(flickerInterval);
      element.style.opacity = 1;
      isFlickering = false;
    }, 1000);
  }

  setInterval(flicker, 30000);
}

function addWarningBanners(message, enableFlicker) {
  message = decomposeTemplate(renderTemplate(message, getTemplateVars()));

  // Top banner
  const topBanner = createBanner('aws-account-warning-banner-top', 'top', message);
  if (topBanner) {
    document.body.insertBefore(topBanner, document.body.firstChild);
    if (enableFlicker) {
      addFlickerEffect(topBanner);
    }

    // Adjust body padding
    document.body.style.paddingTop = `${parseFloat(getComputedStyle(topBanner).height) + 10}px`;

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
    setupBottomBannerInteraction(bottomBanner);
    if (enableFlicker) {
      addFlickerEffect(bottomBanner);
    }
  }
}

function decomposeTemplate(template) {
  const parts = {
    text: '',
    meta: {},
  };

  let currentPart = '';
  let isMetadata = false;
  let currentMetaKey = '';
  let currentMetaValue = '';
  let inQuote = false;
  let quoteChar = '';

  for (let i = 0; i < template.length; i++) {
    if (template[i] === '@' && template[i + 1] === '@') {
      currentPart += '@';
      i++; // Skip the next '@'
    } else if (template[i] === '@' && !isMetadata) {
      isMetadata = true;
      parts.text += currentPart;
      currentPart = '';
    } else if (isMetadata && (template[i] === ' ' || i === template.length - 1) && !inQuote) {
      if (i === template.length - 1 && template[i] !== ' ') {
        currentMetaValue += template[i];
      }
      parts.meta[currentMetaKey] = currentMetaValue;
      isMetadata = false;
      currentMetaKey = '';
      currentMetaValue = '';
    } else if (isMetadata && template[i] === '=' && !inQuote) {
      currentMetaKey = currentPart.trim();
      currentPart = '';
    } else if (isMetadata && (template[i] === "'" || template[i] === '"') && !inQuote) {
      inQuote = true;
      quoteChar = template[i];
    } else if (isMetadata && template[i] === quoteChar && inQuote) {
      inQuote = false;
      parts.meta[currentMetaKey] = currentMetaValue;
      isMetadata = false;
      currentMetaKey = '';
      currentMetaValue = '';
      i++; // Skip the space after the closing quote
    } else if (isMetadata) {
      if (currentMetaKey) {
        currentMetaValue += template[i];
      } else {
        currentPart += template[i];
      }
    } else {
      currentPart += template[i];
    }
  }

  parts.text += currentPart.trim();
  return parts;
}

function escapeHTML(str) {
  return str.replace(
    /[&<>'"]/g,
    (tag) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;',
    }[tag]),
  );
}

function evaluateCondition(condition, vars) {
  const [left, operator, ...rightParts] = condition.split(/\s+/);
  const right = rightParts.join(' '); // Join back the rest in case of a space in the value
  const leftValue = vars[left] !== undefined ? vars[left] : left;
  const rightValue = right.replace(/['"]/g, ''); // Remove quotes if present

  switch (operator) {
    case '==': return leftValue == rightValue;
    case '!=': return leftValue != rightValue;
    case '>': return leftValue > rightValue;
    case '<': return leftValue < rightValue;
    case '>=': return leftValue >= rightValue;
    case '<=': return leftValue <= rightValue;
    default: return false;
  }
}

function renderTemplate(template, vars) {
  let result = template;

  // Handle if-elseif-else statements
  result = result.replace(/\{\{\s*if\s+(.+?)\s*\}\}([\s\S]*?)\{\{\s*fi\s*\}\}/g, (match, condition, content) => {
    const parts = content.split(/\{\{\s*(else?if\s+.+?|else)\s*\}\}/);
    let conditionMet = evaluateCondition(condition, vars);
    if (conditionMet) {
      return renderTemplate(parts[0], vars);
    }
    for (let i = 1; i < parts.length; i++) {
      const elseIfMatch = parts[i].match(/^elseif\s+(.+)$/);
      if (elseIfMatch) {
        conditionMet = evaluateCondition(elseIfMatch[1], vars);
        if (conditionMet) {
          return renderTemplate(parts[i + 1], vars);
        }
      } else if (parts[i].trim() === 'else') {
        return renderTemplate(parts[i + 1], vars);
      }
    }
    return '';
  });

  // Handle variable replacements
  result = result.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key) => {
    if (key in vars) {
      return escapeHTML(String(vars[key]));
    }
    return match;
  });

  return result;
}

function getTemplateVars() {
  const vars = {};

  const accountLabel = document.querySelector('[aria-controls="menu--account"]');
  const accountNumberSpan = Array.from(document.querySelector('header').querySelectorAll('span'))
    .find((span) => /^\d{4}-\d{4}-\d{4}$/.test(span.textContent.trim()));

  vars.accountName = accountLabel ? accountLabel.getAttribute('aria-label') : 'Unknown';
  vars.accountNumber = accountNumberSpan ? accountNumberSpan.textContent.trim() : 'Unknown';

  return vars;
}

function checkAccountNumber() {
  const headerElement = document.querySelector('header');
  if (!headerElement) return;

  const accountNumberSpan = Array.from(headerElement.querySelectorAll('span'))
    .find((span) => /^\d{4}-\d{4}-\d{4}$/.test(span.textContent.trim()));

  if (accountNumberSpan) {
    const accountNumber = accountNumberSpan.textContent.trim();

    chrome.storage.sync.get(['accountNumbers', 'warningMessage', 'enableFlicker'], (result) => {
      const watchList = result.accountNumbers ? result.accountNumbers.split('\n') : [];
      const message = result.warningMessage || 'WARNING: You are on a production AWS account!';
      const enableFlicker = result.enableFlicker || false;

      if (watchList.includes(accountNumber)) {
        addWarningBanners(message, enableFlicker);
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
