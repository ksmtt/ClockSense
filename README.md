# Clockify Contract Hours Tracker

Advanced time tracking addon for Clockify that compares actual hours worked against contracted hours with multi-contract support, overtime analysis, and trend tracking.

## 🚀 Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Your app will be available at `http://localhost:3000`

### Build for Production

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

## 📝 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run serve` - Serve production build on port 4173
- `npm run build:dev` - Build with development mode
- `npm run build:prod` - Build with production mode
- `npm run type-check` - Run TypeScript type checking
- `npm run clean` - Clean build artifacts

## 🌐 Deployment

### GitHub Pages

This project is automatically deployed to GitHub Pages when you push to the `main` branch.

**Live URLs**:

- **Main App**: https://ksmtt.github.io/ClockSense/
- **Manifest**: https://ksmtt.github.io/ClockSense/manifest.json
- **Privacy Policy**: https://ksmtt.github.io/ClockSense/privacy-policy.html

### Clockify Addon Integration

To install this addon in Clockify:

1. Copy the manifest URL: `https://ksmtt.github.io/ClockSense/manifest.json`
2. Go to Clockify > Add-ons > Add Custom Add-on
3. Paste the manifest URL and install

### Setup GitHub Pages

1. **Enable GitHub Pages** in repository settings:

   - Go to Settings > Pages
   - Source: "GitHub Actions"

2. **Push to main branch** to trigger deployment:

   ```bash
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin main
   ```

3. **Check deployment status** in the Actions tab

## 🛠️ Environment Configuration

### Environment Files

- `.env.development` - Development environment settings
- `.env.production` - Production environment settings
- `.env.local` - Local development overrides (ignored by git)

### Available Environment Variables

- `VITE_NODE_ENV` - Environment mode
- `VITE_API_BASE_URL` - Base URL for API calls
- `VITE_APP_TITLE` - Application title
- `VITE_DEBUG` - Enable debug mode
- `VITE_ENABLE_MOCK_DATA` - Use mock data for development

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── dashboard/       # Dashboard layout and widgets
│   ├── ui/             # ShadCN UI components (don't modify)
│   └── figma/          # Figma imports (don't modify)
├── hooks/              # Custom React hooks
├── services/           # API services
├── constants/          # Static configuration
├── guidelines/         # Design system documentation
├── styles/            # Global styles and CSS variables
└── tokens.json        # Design tokens

public/
├── manifest.json       # Clockify addon manifest (publicly accessible)
├── privacy-policy.html # Privacy policy (publicly accessible)
└── icon.png           # Addon icon (add your own)
```

## 🎨 Design System

This project follows a three-layer design system:

1. **Design Tokens** (`src/tokens.json`) - Source of truth for colors, typography, spacing
2. **CSS Variables** (`src/styles/globals.css`) - Semantic mapping and theme support
3. **Components** - Implementation using CSS variables

### Key Principles

- Always check `src/tokens.json` first for existing design tokens
- Use CSS variables for theme-dependent values
- Use Tailwind classes for static utilities
- Follow the established naming conventions

## 🔧 Development Guidelines

- **Check tokens.json first** before adding new colors/fonts
- **Use existing CSS variables** for consistent theming
- **Follow component patterns** in `src/guidelines/Guidelines.md`
- **Test responsive design** on different screen sizes
- **Include proper loading states** and error handling

## 📚 Documentation

- [`src/guidelines/Guidelines.md`](src/guidelines/Guidelines.md) - Comprehensive design guidelines
- [`.github/copilot-instructions.md`](.github/copilot-instructions.md) - AI development instructions
- [Privacy Policy](https://ksmtt.github.io/ClockSense/privacy-policy.html) - Data handling and privacy information

## 🔒 Privacy & Security

This addon prioritizes user privacy:

- **Local Data Storage**: All data stored in your browser, not external servers
- **Optional API Integration**: Clockify API access only when you enable it
- **No Tracking**: No analytics, cookies, or third-party tracking
- **Open Source**: Full transparency - review the code yourself
- **GDPR Compliant**: Designed to meet European privacy standards

## 🤝 Contributing

1. Follow the design system guidelines
2. Test your changes locally
3. Ensure responsive design works
4. Add proper TypeScript types
5. Include loading states and error handling

---

_Original Figma design: https://www.figma.com/design/lo6mwDGD2Qrg4Eu2pGaXQe/Report-Comparison-Addon_
