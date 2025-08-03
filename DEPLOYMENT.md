# Deploying QR Generator to Vercel

This guide will help you deploy your QR Code Generator application to Vercel.

## Prerequisites

1. **Git Repository**: Your project should be in a Git repository (GitHub, GitLab, or Bitbucket)
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com) (free tier available)

## Deployment Methods

### Method 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Add Vercel deployment configuration"
   git push origin main
   ```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com) and sign in
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will automatically detect it as a static site

3. **Configure deployment**:
   - Project Name: `qr-generator` (or your preferred name)
   - Framework Preset: `Other` (static site)
   - Root Directory: `./` (leave as default)
   - Build Command: Leave empty (static site)
   - Output Directory: `./` (leave as default)

4. **Deploy**:
   - Click "Deploy"
   - Wait for deployment to complete
   - Your app will be available at `https://your-project-name.vercel.app`

### Method 2: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy from your project directory**:
   ```bash
   vercel
   ```
   - Follow the prompts
   - Choose your deployment settings
   - Your app will be deployed automatically

### Method 3: Deploy via Git Integration

1. **Connect your repository**:
   - In Vercel dashboard, go to "Import Project"
   - Connect your Git provider (GitHub/GitLab/Bitbucket)
   - Select your repository

2. **Automatic deployments**:
   - Every push to your main branch will trigger a new deployment
   - Pull requests will create preview deployments

## Project Structure

Your project is already configured for Vercel deployment:

```
qr-generator/
├── index.html          # Main HTML file (entry point)
├── script.js           # Main JavaScript functionality
├── styles.css          # Styling
├── qrcodegen.js        # QR code generation library
├── package.json        # Project configuration
├── vercel.json         # Vercel deployment configuration
└── .gitignore          # Git ignore rules
```

## Environment Configuration

The `vercel.json` file includes:
- Static site configuration
- Security headers
- Routing rules
- Performance optimizations

## Custom Domain (Optional)

1. **Add custom domain**:
   - Go to your project settings in Vercel
   - Click "Domains"
   - Add your custom domain
   - Follow DNS configuration instructions

## Troubleshooting

### Common Issues:

1. **Build fails**:
   - Check that all files are committed to Git
   - Ensure `vercel.json` is properly formatted

2. **404 errors**:
   - Verify `index.html` is in the root directory
   - Check routing configuration in `vercel.json`

3. **JavaScript errors**:
   - Check browser console for errors
   - Ensure all dependencies are properly loaded

### Performance Tips:

1. **Enable compression**: Already configured in `vercel.json`
2. **Use CDN**: Vercel automatically provides global CDN
3. **Optimize images**: Consider using WebP format for better performance

## Features Included

Your QR Generator includes:
- ✅ Responsive design
- ✅ Real-time QR code generation
- ✅ Customizable colors and sizes
- ✅ PNG/JPG download options
- ✅ Mobile-friendly interface
- ✅ Error handling and validation

## Post-Deployment

After successful deployment:

1. **Test functionality**:
   - Generate QR codes with different inputs
   - Test download functionality
   - Verify mobile responsiveness

2. **Share your app**:
   - Your app will be available at `https://your-project-name.vercel.app`
   - Share the URL with users

3. **Monitor usage**:
   - Check Vercel analytics for usage statistics
   - Monitor performance metrics

## Support

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Vercel Community**: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)

---

**Note**: This is a static web application that requires no server-side processing, making it perfect for Vercel's edge network deployment.