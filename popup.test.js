// Mock chrome.storage.sync
const mockChrome = {
    storage: {
      sync: {
        get: jest.fn((keys, callback) => 
          callback({
            accountNumbers: '',
            warningMessage: '**WARNING: You are on a production AWS account!**'
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
    });
  
    test('loads saved account numbers and warning message', () => {
      // Trigger DOMContentLoaded event
      document.dispatchEvent(new Event('DOMContentLoaded'));
  
      expect(chrome.storage.sync.get).toHaveBeenCalled();
      expect(document.getElementById('accountNumbers').value).toBe('');
      expect(document.getElementById('warningMessage').value).toBe('**WARNING: You are on a production AWS account!**');
    });
  
    test('saves formatted account numbers and sanitized warning message', () => {
      document.getElementById('accountNumbers').value = '123456789012\n345678901234';
      document.getElementById('warningMessage').value = 'Test <script>alert("xss")</script>';
      document.getElementById('save').click();
  
      expect(chrome.storage.sync.set).toHaveBeenCalledWith({
        accountNumbers: '1234-5678-9012\n3456-7890-1234',
        warningMessage: 'Test &amp;lt;script&amp;gt;alert(&quot;xss&quot;)&amp;lt;/script&amp;gt;'
      }, expect.any(Function));
      expect(window.close).toHaveBeenCalled();
    });
  });