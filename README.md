# QR Code Generator

A modern, responsive QR code generator web application that allows users to create QR codes with customizable colors and sizes, and download them in PNG or JPG formats.

## Features

- ✨ **Real-time QR Code Generation** - Generate QR codes instantly as you type
- 🎨 **Customizable Colors** - Choose custom foreground and background colors
- 📏 **Adjustable Size** - Set QR code size from 128px to 512px
- 💾 **Download Options** - Download as PNG or JPG format
- 📱 **Mobile Responsive** - Works perfectly on all devices
- ⚡ **Fast & Lightweight** - No server required, runs entirely in the browser
- 🔒 **Privacy Focused** - All processing happens locally, no data sent to servers

## Live Demo

🚀 **[View Live Demo](https://your-project-name.vercel.app)**

## Quick Start

1. Enter your text, URL, or any content in the text area
2. Customize the size and colors (optional)
3. Click "Generate QR Code" or it will auto-generate as you type
4. Download your QR code in PNG or JPG format

## Local Development

```bash
# Clone the repository
git clone <your-repo-url>
cd qr-generator

# Install dependencies
npm install

# Start development server
npm start
```

The application will be available at `http://localhost:2025`

## Deployment

This application is ready for deployment on Vercel. See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=<your-repo-url>)

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **QR Generation**: Nayuki QR Code Generator Library
- **Styling**: Custom CSS with modern design
- **Icons**: Font Awesome
- **Deployment**: Vercel (recommended)

## Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers

## Project Structure

```
qr-generator/
├── index.html          # Main HTML file
├── script.js           # Application logic
├── styles.css          # Styling
├── qrcodegen.js        # QR code generation library
├── package.json        # Project configuration
├── vercel.json         # Vercel deployment config
├── DEPLOYMENT.md       # Deployment guide
└── README.md           # This file
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Nayuki QR Code Generator](https://www.nayuki.io/page/qr-code-generator-library) - QR code generation library
- [Font Awesome](https://fontawesome.com/) - Icons
- [Vercel](https://vercel.com/) - Deployment platform

---

Made with ❤️ for the open source community