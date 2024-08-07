// Mock chrome.storage.sync
const mockChrome = {
  storage: {
    sync: {
      get: jest.fn((keys, callback) => 
        callback({
          accountNumbers: '',
          warningMessage: '**WARNING: You are on a production AWS account!**',
          enableFlicker: false
        })
      ),
      set: jest.fn((obj, callback) => callback())
    }
  }
};

global.chrome = mockChrome;

// Mock DOM elements
document.body.innerHTML = `
  <textarea id="accountNumbers"></textarea>
  <input id="warningMessage" />
  <input id="enableFlicker" type="checkbox" />
  <button id="save"></button>
`;

// Mock window.close
window.close = jest.fn();

const originalConsoleLog = console.log;
console.log = jest.fn();

// Import the functions to test
require('./popup.js');

describe('Popup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.getElementById('accountNumbers').value = '';
    document.getElementById('warningMessage').value = '';
    document.getElementById('enableFlicker').checked = false;
  });

  test('loads saved account numbers, warning message, and flicker setting', () => {
    // Trigger DOMContentLoaded event
    document.dispatchEvent(new Event('DOMContentLoaded'));

    expect(chrome.storage.sync.get).toHaveBeenCalled();
    expect(document.getElementById('accountNumbers').value).toBe('');
    expect(document.getElementById('warningMessage').value).toBe('**WARNING: You are on a production AWS account!**');
    expect(document.getElementById('enableFlicker').checked).toBe(false);
  });

  test('saves formatted account numbers, sanitized warning message, and flicker setting', () => {
    document.getElementById('accountNumbers').value = '123456789012\n345678901234';
    document.getElementById('warningMessage').value = 'Test <script>alert("xss")</script>';
    document.getElementById('enableFlicker').checked = true;
    document.getElementById('save').click();

    expect(chrome.storage.sync.set).toHaveBeenCalledWith({
      accountNumbers: '1234-5678-9012\n3456-7890-1234',
      warningMessage: 'Test &amp;lt;script&amp;gt;alert(&quot;xss&quot;)&amp;lt;/script&amp;gt;',
      enableFlicker: true
    }, expect.any(Function));
    expect(window.close).toHaveBeenCalled();
  });

  test('formats account numbers correctly', () => {
    document.getElementById('accountNumbers').value = '123456789012\n34567890123\n5678901234567\nabc123456789';
    document.getElementById('save').click();

    expect(chrome.storage.sync.set).toHaveBeenCalledWith(
      expect.objectContaining({
        accountNumbers: '1234-5678-9012'
      }),
      expect.any(Function)
    );
  });

  test('sanitizes warning message', () => {
    document.getElementById('warningMessage').value = '<strong>Warning!</strong> & "Caution"';
    document.getElementById('save').click();

    expect(chrome.storage.sync.set).toHaveBeenCalledWith(
      expect.objectContaining({
        warningMessage: '&amp;lt;strong&amp;gt;Warning!&amp;lt;/strong&amp;gt; &amp; &quot;Caution&quot;'
      }),
      expect.any(Function)
    );
  });
});