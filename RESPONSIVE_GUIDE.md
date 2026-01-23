# HR Solution - Responsive Web Application

## Cross-Platform Compatibility

This application is fully responsive and works seamlessly across:
- ✅ **Windows** (Chrome, Edge, Firefox)
- ✅ **macOS** (Safari, Chrome, Firefox)
- ✅ **Linux** (Chrome, Firefox)
- ✅ **Mobile devices** (iOS Safari, Android Chrome)
- ✅ **Tablets** (iPad, Android tablets)

## Responsive Design Features

### Desktop (1025px+)
- Full sidebar navigation always visible
- Multi-column layouts for data tables
- Extended search bar
- Full user profile display

### Tablet (768px - 1024px)
- Collapsible sidebar with hamburger menu
- Optimized spacing and padding
- Responsive grid layouts
- Touch-friendly buttons

### Mobile (< 768px)
- Full mobile menu with overlay
- Stacked layouts for better readability
- Horizontal scrolling tables
- Simplified navigation
- Optimized input sizes

### Small Mobile (< 480px)
- Minimal header with essential actions only
- Compact cards and spacing
- Large touch targets
- Optimized for one-handed use

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Installation Steps

1. **Clone the repository** (if applicable)
```bash
git clone <repository-url>
cd hr-solution
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env` file in the root directory:
```env
VITE_API_URL=http://localhost:3001
```

4. **Start the development server**
```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the port shown in your terminal).

## Building for Production

### Build the application
```bash
npm run build
```

### Preview the production build
```bash
npm run preview
```

## Platform-Specific Notes

### Windows
- Uses Segoe UI as the primary font
- Tested on Chrome, Edge, and Firefox
- Full support for touch screens

### macOS
- Uses San Francisco system font
- Optimized for Retina displays
- Supports macOS gestures
- Glassmorphism effects enabled with backdrop-filter

### Linux
- Font rendering optimized for various DPI settings
- Tested on Ubuntu, Fedora, and Arch Linux
- Works with GNOME, KDE, and other desktop environments

## Browser Support

| Browser | Windows | macOS | Linux | Mobile |
|---------|---------|-------|-------|--------|
| Chrome  | ✅ 90+  | ✅ 90+ | ✅ 90+ | ✅ 90+ |
| Firefox | ✅ 88+  | ✅ 88+ | ✅ 88+ | ✅ 88+ |
| Safari  | N/A     | ✅ 14+ | N/A    | ✅ 14+ |
| Edge    | ✅ 90+  | ✅ 90+ | ✅ 90+ | N/A    |

## Responsive Breakpoints

```css
Mobile:        < 480px
Small Mobile:  480px - 768px
Tablet:        768px - 1024px
Desktop:       > 1024px
```

## Key Features

### Responsive Navigation
- **Desktop**: Persistent sidebar navigation
- **Mobile**: Collapsible sidebar with hamburger menu
- **Touch**: Smooth slide-in animation with overlay

### Adaptive Layouts
- **Grid System**: Auto-fitting columns based on screen size
- **Cards**: Stacked on mobile, grid on desktop
- **Tables**: Horizontal scroll on small screens
- **Forms**: Full-width inputs on mobile

### Cross-Browser Compatibility
- CSS custom properties with fallbacks
- Flexbox and Grid layouts
- Modern JavaScript (ES6+)
- Polyfills for older browsers (if needed)

## Performance Optimizations

- **Code Splitting**: Lazy loading of routes
- **Asset Optimization**: Minified CSS and JavaScript
- **Font Loading**: System fonts for faster rendering
- **Image Optimization**: Responsive images with appropriate sizes

## Accessibility Features

- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: ARIA labels and semantic HTML
- **Focus Indicators**: Visible focus states
- **Color Contrast**: WCAG AA compliant
- **Reduced Motion**: Respects user preferences

## Testing Responsive Design

### Using Browser DevTools

**Chrome/Edge DevTools:**
1. Press `F12` or right-click and select "Inspect"
2. Click the "Toggle device toolbar" icon (or press `Ctrl+Shift+M`)
3. Select different devices or set custom dimensions

**Firefox DevTools:**
1. Press `F12` or right-click and select "Inspect Element"
2. Click the "Responsive Design Mode" icon (or press `Ctrl+Shift+M`)
3. Choose device or enter custom dimensions

**Safari DevTools (macOS):**
1. Enable Developer menu: Preferences → Advanced → Show Develop menu
2. Select Develop → Enter Responsive Design Mode
3. Choose device or set custom dimensions

### Testing on Real Devices

**Desktop:**
- Resize browser window to test different breakpoints
- Test on multiple browsers (Chrome, Firefox, Edge, Safari)
- Test with different zoom levels (90%, 100%, 110%, 125%)

**Mobile:**
- Use actual mobile devices when possible
- Test both portrait and landscape orientations
- Test on different screen sizes (small phones, tablets)

## Troubleshooting

### Issue: Sidebar not displaying on mobile
**Solution**: Clear browser cache and ensure JavaScript is enabled

### Issue: Layout broken on specific browser
**Solution**: Update browser to the latest version. Check browser console for errors.

### Issue: Text too small on mobile
**Solution**: Ensure viewport meta tag is present in index.html:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```

### Issue: Scrolling issues on mobile
**Solution**: Disable browser extensions and ensure `-webkit-overflow-scrolling: touch` is supported

## Development

### Recommended IDE Setup
- **VS Code** with the following extensions:
  - ESLint
  - Prettier
  - TypeScript
  - React Developer Tools

### Code Structure
```
src/
├── components/       # Reusable UI components
│   ├── DashboardLayout.tsx
│   ├── AdminLayout.tsx
│   └── ...
├── pages/           # Page components
│   ├── Candidates.tsx
│   ├── Dashboard.tsx
│   └── ...
├── styles/          # Global styles
│   └── index.css    # Responsive CSS
├── utils/           # Utility functions
└── App.tsx          # Main app component
```

## Contributing

When adding new features, ensure:
1. ✅ Responsive design is implemented
2. ✅ Tested on multiple browsers
3. ✅ Mobile-friendly touch targets
4. ✅ Accessibility standards met
5. ✅ Cross-platform fonts considered

## License

[Add your license information here]

## Support

For issues or questions:
- Create an issue on GitHub
- Contact the development team
- Check the FAQ section

---

**Note**: This application uses modern web standards. For the best experience, use an up-to-date browser on any supported platform.
