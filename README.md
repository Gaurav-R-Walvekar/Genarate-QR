# QR Code Generator

A modern, responsive web application for generating QR codes with custom size and download options.

## Features

- **Text Input**: Enter any text, URL, contact information, or other data
- **Size Customization**: Adjust QR code size from 128px to 512px
- **Color Customization**: Choose custom foreground and background colors
- **Download Options**: Download QR codes in PNG or JPG format
- **Real-time Generation**: QR codes are generated automatically as you type
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Modern UI**: Beautiful gradient design with smooth animations

## How to Use

### Quick Start

1. **Open the application**: Simply open `index.html` in your web browser
2. **Enter text**: Type any text, URL, or content in the text area
3. **Customize settings**: Adjust size and colors using the controls
4. **Download**: Click the download buttons to save as PNG or JPG

### Features Explained

#### Input Options
- **Text/URL**: Enter any text content, website URLs, contact information
- **Contact Info**: Phone numbers, email addresses, business cards
- **WiFi**: Network credentials (SSID and password)
- **Location**: GPS coordinates or addresses

#### Size Customization
- Use the slider to adjust QR code size from 128px to 512px
- Larger sizes provide better quality for printing
- Smaller sizes are perfect for web use

#### Color Options
- **Foreground Color**: The main QR code color (default: black)
- **Background Color**: The background color (default: white)
- Choose any colors that provide good contrast

#### Download Options
- **PNG**: High-quality format with transparency support
- **JPG**: Compressed format suitable for web use
- Files are automatically named with timestamps

## Installation

### Option 1: Direct Use
1. Download all files to a folder
2. Open `index.html` in any modern web browser
3. Start generating QR codes!

### Option 2: Local Server (Recommended)
1. Install Node.js if you haven't already
2. Open terminal/command prompt in the project folder
3. Run: `npm install`
4. Run: `npm start`
5. Open your browser to `http://localhost:3000`

## File Structure

```
qr-generator/
├── index.html          # Main HTML file
├── styles.css          # CSS styling
├── script.js           # JavaScript functionality
├── package.json        # Project dependencies
└── README.md          # This file
```

## Browser Compatibility

- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ❌ Internet Explorer (not supported)

## Technical Details

### Dependencies
- **QRCode.js**: For QR code generation
- **Font Awesome**: For icons
- **Live Server**: For development (optional)

### Features
- **Debounced Input**: Prevents excessive API calls
- **Error Handling**: Graceful error messages
- **Loading States**: Visual feedback during generation
- **Auto-scroll**: Smooth scrolling to results
- **Keyboard Shortcuts**: Ctrl+Enter to generate

## Usage Examples

### Basic QR Code
1. Enter: `https://example.com`
2. Click "Generate QR Code"
3. Download as PNG

### Contact Information
1. Enter: `BEGIN:VCARD\nVERSION:3.0\nFN:John Doe\nTEL:+1234567890\nEMAIL:john@example.com\nEND:VCARD`
2. Adjust size to 256px
3. Download as JPG

### WiFi Network
1. Enter: `WIFI:S:MyWiFi;T:WPA;P:mypassword123;;`
2. Choose custom colors
3. Download in preferred format

## Troubleshooting

### QR Code Not Generating
- Check if you've entered text in the input field
- Ensure your browser supports JavaScript
- Try refreshing the page

### Download Not Working
- Check if your browser allows downloads
- Ensure you have sufficient disk space
- Try a different browser

### Poor QR Code Quality
- Increase the size using the slider
- Ensure good contrast between colors
- Use high error correction level (already set to maximum)

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is open source and available under the MIT License.

---

**Enjoy generating QR codes!** 🎉 