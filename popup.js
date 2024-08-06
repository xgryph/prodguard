document.addEventListener('DOMContentLoaded', function() {
  const textarea = document.getElementById('accountNumbers');
  const warningMessageInput = document.getElementById('warningMessage');
  const saveButton = document.getElementById('save');

  // Load saved account numbers and warning message
  chrome.storage.sync.get(['accountNumbers', 'warningMessage'], function(result) {
    textarea.value = result.accountNumbers || '';
    warningMessageInput.value = result.warningMessage || 'WARNING: You are using a production AWS account!';
  });

  // Save account numbers and warning message
  saveButton.addEventListener('click', function() {
    // Format account numbers
    const formattedNumbers = textarea.value.split('\n')
      .map(num => num.replace(/[^0-9]/g, ''))  // Remove non-digit characters
      .filter(num => num.length === 12)  // Keep only 12-digit numbers
      .map(num => `${num.substr(0, 4)}-${num.substr(4, 4)}-${num.substr(8, 4)}`)  // Format as XXXX-XXXX-XXXX
      .join('\n');

    // Sanitize warning message
    const sanitizedMessage = warningMessageInput.value
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

    chrome.storage.sync.set({
      accountNumbers: formattedNumbers,
      warningMessage: sanitizedMessage
    }, function() {
      console.log('Settings saved');
      // Update the textarea with the formatted account numbers
      textarea.value = formattedNumbers;
      
      // Close the popup
      window.close();
    });
  });
});
