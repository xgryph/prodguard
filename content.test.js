// Mock chrome.storage.sync
const mockChrome = {
    storage: {
      sync: {
        get: jest.fn((keys, callback) => 
          callback({
            accountNumbers: '1234-5678-9012\n3456-7890-1234',
            warningMessage: 'Test Warning'
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
    });
  
    afterEach(() => {
      // Disconnect the observer after each test
      if (global.observer) {
        global.observer.disconnect();
      }
    });
  
    test('creates warning banners when account number matches', () => {
      document.body.innerHTML = `
        <header>
          <span>1234-5678-9012</span>
        </header>
      `;
  
      checkAccountNumber();
  
      expect(document.getElementById('aws-account-warning-banner-top')).not.toBeNull();
      expect(document.getElementById('aws-account-warning-banner-bottom')).not.toBeNull();
      expect(document.getElementById('aws-account-warning-banner-top').textContent).toBe('Test Warning');
    });
  
    test('does not create warning banners when account number does not match', () => {
      document.body.innerHTML = `
        <header>
          <span>9999-9999-9999</span>
        </header>
      `;
  
      checkAccountNumber();
  
      expect(document.getElementById('aws-account-warning-banner-top')).toBeNull();
      expect(document.getElementById('aws-account-warning-banner-bottom')).toBeNull();
    });
  });