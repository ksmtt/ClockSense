# Icon and Gallery Creation Instructions

## 🎨 Convert SVG Icon to PNG

### Step 1: Convert addon-icon.svg to PNG

1. Open `assets/addon-icon.svg` in any design tool (Figma, Canva, Photoshop, or online converter)
2. Export/Save as PNG with these specifications:
   - **Size**: 300x300px
   - **Format**: PNG
   - **Background**: Transparent or the blue background from SVG
   - **File size**: Under 5MB (should be ~50KB)
3. Save as `public/icon.png`

### Alternative: Use online converter

- Visit https://convertio.co/svg-png/
- Upload `assets/addon-icon.svg`
- Set dimensions to 300x300px
- Download and rename to `icon.png`

## 📸 Gallery Images (1200x780px)

Create 5 high-quality screenshots/mockups at 1200x780px:

### 1. Dashboard Overview

- **Content**: Main dashboard showing multiple contract widgets
- **Elements**: Contract progress bars, charts, sidebar navigation
- **Focus**: Overall layout and functionality

### 2. Contract Management

- **Content**: Contract creation/editing modal or page
- **Elements**: Form fields, contract details, save buttons
- **Focus**: User-friendly interface for managing contracts

### 3. Time Analysis & Charts

- **Content**: Charts and analytics view
- **Elements**: Overtime analysis, weekly trends, progress charts
- **Focus**: Data visualization capabilities

### 4. Clockify Integration

- **Content**: Settings page with API configuration
- **Elements**: API key input, connection status, sync options
- **Focus**: Easy integration setup

### 5. Mobile/Responsive View

- **Content**: Mobile layout of main features
- **Elements**: Touch-friendly interface, responsive design
- **Focus**: Cross-device compatibility

## 🛠️ Tools for Creating Screenshots

### Option 1: Live App Screenshots

1. Run `npm run dev` (localhost:3001)
2. Use browser dev tools to set viewport to 1200x780
3. Take screenshots of different views
4. Edit/enhance in image editor

### Option 2: Design Tool Mockups

1. Use Figma, Sketch, or Photoshop
2. Create mockups based on actual app design
3. Use existing screenshots as reference
4. Enhance with annotations or highlights

### Option 3: Online Tools

- Use https://mockuphone.com for device mockups
- Use https://smartmockups.com for professional presentation
- Use browser screenshot extensions for automated capture

## 📋 Quality Guidelines

### For All Images:

- **Resolution**: Exactly 1200x780px for gallery, 300x300px for icon
- **Format**: PNG or JPG
- **File size**: Under 5MB each
- **Quality**: High resolution, crisp text, clear interface elements
- **Branding**: Consistent with ClockSense brand colors (#03a9f4)

### Content Guidelines:

- Show realistic data (not obviously fake)
- Highlight key features and benefits
- Include diverse use cases (multiple contracts, different time ranges)
- Demonstrate mobile responsiveness
- Show integration with Clockify

## 🎯 Next Steps

1. **Icon**: Convert SVG to PNG and place in `public/icon.png`
2. **Gallery**: Create 5 images at 1200x780px
3. **Test**: Ensure all URLs are accessible after deployment
4. **Submit**: Use assets in Clockify marketplace submission

## 📁 File Structure After Creation

```
public/
├── icon.png (300x300px)
├── manifest.json ✅
├── privacy-policy.html ✅
└── terms-of-use.html ✅

assets/
├── addon-icon.svg ✅
├── addon-submission.md ✅
├── gallery-1-dashboard.png (1200x780px)
├── gallery-2-contracts.png (1200x780px)
├── gallery-3-analytics.png (1200x780px)
├── gallery-4-settings.png (1200x780px)
└── gallery-5-mobile.png (1200x780px)
```
