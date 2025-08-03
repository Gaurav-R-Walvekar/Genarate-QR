// DOM Elements
const qrText = document.getElementById('qr-text');
const qrSize = document.getElementById('qr-size');
const sizeValue = document.getElementById('size-value');
const qrForeground = document.getElementById('qr-foreground');
const qrBackground = document.getElementById('qr-background');
const generateBtn = document.getElementById('generate-btn');
const outputSection = document.getElementById('output-section');
const qrCanvas = document.getElementById('qr-canvas');
const downloadPngBtn = document.getElementById('download-png');
const downloadJpgBtn = document.getElementById('download-jpg');

// QR Code state
let qrCodeGenerated = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Set up event listeners
    setupEventListeners();
    
    // Auto-generate QR code when text is entered
    qrText.addEventListener('input', debounce(autoGenerateQR, 500));
});

function setupEventListeners() {
    // Size slider
    qrSize.addEventListener('input', function() {
        sizeValue.textContent = this.value + 'px';
        if (qrText.value.trim()) {
            generateQRCode();
        }
    });

    // Color inputs
    qrForeground.addEventListener('change', function() {
        if (qrText.value.trim()) {
            generateQRCode();
        }
    });

    qrBackground.addEventListener('change', function() {
        if (qrText.value.trim()) {
            generateQRCode();
        }
    });

    // Generate button
    generateBtn.addEventListener('click', function() {
        if (qrText.value.trim()) {
            generateQRCode();
        } else {
            showError('Please enter some text to generate a QR code.');
        }
    });

    // Download buttons
    downloadPngBtn.addEventListener('click', () => downloadQR('png'));
    downloadJpgBtn.addEventListener('click', () => downloadQR('jpg'));

    // Test button
    const testBtn = document.getElementById('test-btn');
    testBtn.addEventListener('click', function() {
        qrText.value = 'https://example.com';
        generateQRCode();
        showSuccess('Test QR code generated! Try scanning it with your mobile camera.');
    });

    // Enter key in textarea
    qrText.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && e.ctrlKey) {
            e.preventDefault();
            if (qrText.value.trim()) {
                generateQRCode();
            }
        }
    });
}

function autoGenerateQR() {
    const text = qrText.value.trim();
    if (text) {
        generateQRCode();
    } else {
        outputSection.style.display = 'none';
    }
}

function generateQRCode() {
    const text = qrText.value.trim();
    if (!text) return;

    // Check if Nayuki QRCode library is available
    if (typeof qrcodegen === 'undefined') {
        showError('QR Code library failed to load. Please refresh the page.');
        return;
    }

    // Show loading state
    generateBtn.classList.add('loading');
    generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';

    try {
        // Clear previous QR code
        qrCodeGenerated = false;

        // Get settings
        const size = parseInt(qrSize.value);
        const foreground = qrForeground.value;
        const background = qrBackground.value;

        // Generate QR code using Nayuki library
        const qr = qrcodegen.QrCode.encodeText(text, qrcodegen.QrCode.Ecc.HIGH);
        
        // Draw QR code to canvas
        drawQrCodeToCanvas(qr, qrCanvas, size, foreground, background);
        
        qrCodeGenerated = true;

        // Show output section
        outputSection.style.display = 'block';
        
        // Update QR info
        document.getElementById('qr-content').textContent = text;
        document.getElementById('qr-size-display').textContent = size + 'px';
        
        // Validate QR code structure
        validateQRCode();
        
        // Scroll to output section
        outputSection.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Reset button
        generateBtn.classList.remove('loading');
        generateBtn.innerHTML = '<i class="fas fa-magic"></i> Generate QR Code';

    } catch (error) {
        console.error('Error generating QR code:', error);
        showError('Error generating QR code. Please try again.');
        
        // Reset button
        generateBtn.classList.remove('loading');
        generateBtn.innerHTML = '<i class="fas fa-magic"></i> Generate QR Code';
    }
}

// Helper function to draw QR code matrix to canvas using Nayuki library
function drawQrCodeToCanvas(qr, canvas, size, darkColor, lightColor) {
    const ctx = canvas.getContext('2d');
    const moduleCount = qr.size;
    const moduleSize = size / moduleCount;
    
    // Set canvas size
    canvas.width = size;
    canvas.height = size;
    
    // Clear and fill background
    ctx.fillStyle = lightColor;
    ctx.fillRect(0, 0, size, size);
    
    // Draw QR modules
    ctx.fillStyle = darkColor;
    for (let y = 0; y < moduleCount; y++) {
        for (let x = 0; x < moduleCount; x++) {
            if (qr.getModule(x, y)) {
                ctx.fillRect(x * moduleSize, y * moduleSize, moduleSize, moduleSize);
            }
        }
    }
}

function downloadQR(format) {
    if (!qrCanvas || qrCanvas.width === 0 || !qrCodeGenerated) {
        showError('No QR code to download. Please generate one first.');
        return;
    }

    try {
        // Create a temporary canvas for the download
        const tempCanvas = document.createElement('canvas');
        const ctx = tempCanvas.getContext('2d');
        
        // Set canvas size
        const size = parseInt(qrSize.value);
        tempCanvas.width = size;
        tempCanvas.height = size;

        // Fill background
        ctx.fillStyle = qrBackground.value;
        ctx.fillRect(0, 0, size, size);

        // Draw QR code
        ctx.drawImage(qrCanvas, 0, 0, size, size);

        // Create download link
        const link = document.createElement('a');
        link.download = `qr-code-${Date.now()}.${format}`;
        
        if (format === 'png') {
            link.href = tempCanvas.toDataURL('image/png');
        } else if (format === 'jpg') {
            link.href = tempCanvas.toDataURL('image/jpeg', 0.9);
        }

        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Show success message
        showSuccess(`QR code downloaded as ${format.toUpperCase()}!`);

    } catch (error) {
        console.error('Error downloading QR code:', error);
        showError('Error downloading QR code. Please try again.');
    }
}

function showError(message) {
    showNotification(message, 'error');
}

function showSuccess(message) {
    showNotification(message, 'success');
}

function showNotification(message, type) {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'check-circle'}"></i>
        <span>${message}</span>
    `;

    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        animation: slideIn 0.3s ease;
        background: ${type === 'error' ? '#dc3545' : '#28a745'};
    `;

    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);

    // Add to page
    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        notification.style.animationFillMode = 'forwards';
        
        const slideOutStyle = document.createElement('style');
        slideOutStyle.textContent = `
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(slideOutStyle);
        
        setTimeout(() => {
            notification.remove();
            style.remove();
            slideOutStyle.remove();
        }, 300);
    }, 3000);
}

// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add some helpful features
function addHelpfulFeatures() {
    // Add placeholder text suggestions
    const suggestions = [
        'https://example.com',
        'Hello World!',
        'Contact: +1-234-567-8900',
        'Email: example@email.com',
        'WiFi: SSID: MyWiFi, Password: mypassword123'
    ];

    // Add suggestion button
    const suggestionBtn = document.createElement('button');
    suggestionBtn.innerHTML = '<i class="fas fa-lightbulb"></i> Try Example';
    suggestionBtn.className = 'suggestion-btn';
    suggestionBtn.style.cssText = `
        position: absolute;
        top: 10px;
        right: 10px;
        background: #ffc107;
        color: #333;
        border: none;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.3s ease;
    `;

    suggestionBtn.addEventListener('click', () => {
        const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
        qrText.value = randomSuggestion;
        generateQRCode();
    });

    // Add to input group
    const inputGroup = document.querySelector('.input-group');
    inputGroup.style.position = 'relative';
    inputGroup.appendChild(suggestionBtn);
}

// QR code validation function
function validateQRCode() {
    const canvas = document.getElementById('qr-canvas');
    if (canvas && canvas.width > 0) {
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Check if QR code has proper contrast
        let darkPixels = 0;
        let lightPixels = 0;
        
        for (let i = 0; i < data.length; i += 4) {
            const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
            if (brightness < 128) {
                darkPixels++;
            } else {
                lightPixels++;
            }
        }
        
        const contrastRatio = darkPixels / lightPixels;
        console.log('QR Code validation - Dark pixels:', darkPixels, 'Light pixels:', lightPixels, 'Ratio:', contrastRatio);
        
        if (contrastRatio > 0.1 && contrastRatio < 0.9) {
            console.log('QR Code structure appears valid');
        } else {
            console.warn('QR Code may have contrast issues');
        }
    }
}

// Initialize helpful features
document.addEventListener('DOMContentLoaded', addHelpfulFeatures); 