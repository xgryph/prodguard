# Prod Guard

Prod Guard is a Chrome extension that adds a warning banner for specific AWS account numbers when browsing the AWS Management Console. This helps users quickly identify when they are working in production environments.

## Features

- Adds prominent red warning banners at the top and bottom of the AWS console for specified account numbers
- Customizable list of AWS account numbers to watch
- Customizable warning message
- Persistent storage of settings across browser sessions
- Template system

## Installation

You can find this extension in the chrome web store here: 
https://chrome.google.com/webstore/detail/pniglgalgpbineeaplglmabhmoicehfn

or

1. Clone this repository or download the source code.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable "Developer mode" in the top right corner.
4. Click "Load unpacked" and select the directory containing the extension files.

## Usage

1. Click on the Prod Guard icon in the Chrome toolbar to open the popup.
2. Enter the AWS account numbers you want to monitor (one per line).
3. Customize the warning message if desired.
4. Click "Save" to apply the settings.
5. Browse the AWS Management Console. If you access an account matching one of the specified numbers, warning banners will appear.

### Template System

You can use a simple template system in your warning message for dynamic content:

- Use `{{variableName}}` to insert dynamic values.
- Use `{{if condition}}...{{elseif condition}}...{{else}}...{{fi}}` for conditional content.

Available variables:
- `{{accountName}}`: The name of the current AWS account
- `{{accountNumber}}`: The number of the current AWS account

Example template:
```
Warning: You are on {{accountName}} ({{accountNumber}})
{{if accountNumber == '1234-5678-9012'}}This is a Production account!{{else}}This is a non-Production account.{{fi}}
```

### Customizing Banner Colors

You can customize the banner colors using special tags in your warning message:

```
@bgcolor="red" @fgcolor="white" Your warning message here
```

## Files

- `manifest.json`: Extension manifest file
- `popup.html`: HTML for the extension popup
- `popup.css`: CSS for the extension popup
- `popup.js`: JavaScript for the popup functionality
- `content.js`: Content script that runs on AWS console pages
- `icon16.png`, `icon32.png`, `icon48.png`, `icon128.png`: Extension icons (not provided in the given files)

## Development

1. Clone this repository
2. Run `npm install` to install dependencies
3. Make changes to the source files as needed
4. Run `npm test` to run the test suite
5. Run `npm run lint` to check for linting errors
6. Run `npm run lint:fix` to automatically fix linting errors where possible

Note: If you're using VS Code with the ESLint extension, linting errors will be highlighted in your code, and many can be automatically fixed on save.

## Packaging for Chrome Web Store

To package the extension for upload to the Chrome Web Store:

1. Ensure all files are up to date and committed
2. Run `npm run package`
3. This will create a `prod-guard.zip` file in the project root
4. Upload this zip file to the Chrome Web Store

## Files included in the package

- manifest.json
- popup.html
- popup.js
- content.js
- icon16.png
- icon32.png
- icon48.png
- icon128.png

Make sure all these files are present and up to date before packaging.

Note: The packaging script uses the `zip` command, which is typically available on Unix-based systems (Linux, macOS). If you're on Windows, you might need to install a zip utility or use an alternative command.

## Security Notes

- The extension uses content security policies and sanitizes user input to prevent XSS attacks.
- Account numbers are formatted and validated before saving.
- The warning message is sanitized to prevent injection of malicious HTML.

## License

This project is licensed under the BSD 3-Clause License:

Copyright (c) 2024, Andrew Czerniachowicz

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its
   contributors may be used to endorse or promote products derived from
   this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

## Contributing

We welcome contributions to Prod Guard! If you'd like to contribute, please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes, ensuring you follow the existing code style.
4. Write or update tests as necessary.
5. Update the documentation, including the README if needed.
6. Submit a pull request with a clear description of your changes.

By contributing to this project, you agree to license your contributions under the same BSD 3-Clause License that covers the project.

Please note that this project follows a Code of Conduct. By participating, you are expected to uphold this code. Please report any unacceptable behavior to xgryph@gmail.com.

## Support

If you encounter any issues or have questions about Prod Guard, please:

1. Check the existing GitHub issues to see if your problem has already been reported.
2. If not, open a new GitHub issue with a clear description of the problem, steps to reproduce it, and your environment details (Chrome version, OS, etc.).
3. For security-related issues, please do not open a GitHub issue. Instead, email xgryph@gmail.com with the details.

I appreciate your feedback and will do my best to address your concerns in a timely manner.