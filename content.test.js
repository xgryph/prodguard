// Mock chrome.storage.sync
const mockChrome = {
  storage: {
    sync: {
      get: jest.fn((keys, callback) => 
        callback({
          accountNumbers: '1234-5678-9012\n3456-7890-1234',
          warningMessage: 'Test Warning @bgcolor="blue" @fgcolor="yellow"',
          enableFlicker: true
        })
      )
    }
  }
};

global.chrome = mockChrome;

// Mock MutationObserver
global.MutationObserver = class {
  constructor(callback) {
    this.callback = callback;
  }
  disconnect() {}
  observe(element, initObject) {}
};

// Import the functions to test
const fs = require('fs');
const path = require('path');
const contentScript = fs.readFileSync(path.resolve(__dirname, 'content.js'), 'utf8');
eval(contentScript);

describe('Content Script', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    if (global.observer) {
      global.observer.disconnect();
    }
    jest.useRealTimers();
  });

  test('creates warning banners with custom colors', () => {
    document.body.innerHTML = `
      <header>
        <span>1234-5678-9012</span>
      </header>
    `;

    checkAccountNumber();

    const topBanner = document.getElementById('aws-account-warning-banner-top');
    const bottomBanner = document.getElementById('aws-account-warning-banner-bottom');

    expect(topBanner).not.toBeNull();
    expect(bottomBanner).not.toBeNull();
    expect(topBanner.style.backgroundColor).toBe('blue');
    expect(topBanner.style.color).toBe('yellow');
    expect(bottomBanner.style.backgroundColor).toBe('blue');
    expect(bottomBanner.style.color).toBe('yellow');
  });

  test('adds flicker effect when enabled', () => {
    document.body.innerHTML = `
      <header>
        <span>1234-5678-9012</span>
      </header>
    `;

    const mockSetInterval = jest.spyOn(global, 'setInterval');
    const mockSetTimeout = jest.spyOn(global, 'setTimeout');

    checkAccountNumber();

    const topBanner = document.getElementById('aws-account-warning-banner-top');
    expect(topBanner).not.toBeNull();

    // Advance timers to trigger flicker effect
    jest.advanceTimersByTime(30000);

    // Check if setInterval was called for both top and bottom banners
    expect(mockSetInterval).toHaveBeenCalledTimes(4);

    // Check if setTimeout was called to stop the flicker effect
    expect(mockSetTimeout).toHaveBeenCalledTimes(2);

    // Clean up
    mockSetInterval.mockRestore();
    mockSetTimeout.mockRestore();
  });

  test('setupBottomBannerInteraction hides and shows banner', () => {
    const banner = document.createElement('div');
    banner.style.bottom = '0';
    document.body.appendChild(banner);

    setupBottomBannerInteraction(banner);

    // Simulate mouseenter event
    banner.dispatchEvent(new Event('mouseenter'));

    // Check if the banner is hidden
    expect(banner.style.bottom).toBe(`-${banner.offsetHeight}px`);

    // Advance timer to show the banner again
    jest.advanceTimersByTime(5000);

    // Check if the banner is shown
    expect(banner.style.bottom).toBe('0px');
  });

  test('decomposeTemplate function', () => {
    const template = 'Warning @bgcolor="red" @fgcolor="white"';
    const result = decomposeTemplate(template);

    expect(result).toEqual({
      text: 'Warning ',
      meta: {
        bgcolor: 'red',
        fgcolor: 'white'
      }
    });
  });

  test('renderTemplate function', () => {
    const template = 'Hello, {{name}}! Your account number is {{accountNumber}}.';
    const vars = {
      name: 'John',
      accountNumber: '1234-5678-9012'
    };

    const result = renderTemplate(template, vars);
    expect(result).toBe('Hello, John! Your account number is 1234-5678-9012.');
  });

  test('renderTemplate function with conditional', () => {
    const template = '{{if accountNumber == "1234-5678-9012"}}Production Account{{else}}Test Account{{fi}}';
    const vars = {
      accountNumber: '1234-5678-9012'
    };

    const result = renderTemplate(template, vars);
    expect(result).toBe('Production Account');
  });

  test('getTemplateVars function', () => {
    document.body.innerHTML = `
      <header>
        <span aria-controls="menu--account" aria-label="Test Account">Test Account</span>
        <span>1234-5678-9012</span>
      </header>
    `;

    const vars = getTemplateVars();
    expect(vars).toEqual({
      accountName: 'Test Account',
      accountNumber: '1234-5678-9012'
    });
  });
});