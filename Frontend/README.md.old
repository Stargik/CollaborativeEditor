# Frontend - Collaborative Diagram Editor

React + TypeScript frontend with SignalR for real-time collaboration.

## Prerequisites

- Node.js 18+ and npm

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Run the Development Server

```bash
npm run dev
```

The application will start on `http://localhost:3000`

## Project Structure

```
Frontend/
├── src/
│   ├── components/         # React components
│   │   ├── Canvas.tsx      # Drawing canvas
│   │   ├── Header.tsx      # App header
│   │   ├── Toolbar.tsx     # Tools toolbar
│   │   ├── Sidebar.tsx     # Users and layers
│   │   └── PropertiesPanel.tsx  # Shape properties
│   ├── hooks/             # Custom React hooks
│   │   └── useWebSocket.ts  # SignalR connection
│   ├── types/             # TypeScript types
│   │   └── index.ts       # Type definitions
│   ├── App.tsx            # Main app component
│   ├── App.css            # App styles
│   ├── main.tsx           # Entry point
│   └── index.css          # Global styles
├── index.html             # HTML template
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript config
├── vite.config.ts         # Vite config
└── README.md              # This file
```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Configuration

### Backend URL

The backend URL is configured in `src/hooks/useWebSocket.ts`:

```typescript
const hubUrl = `http://localhost:5000/diagramHub`
```

Update this if your backend runs on a different port.

### Development Port

The dev server port is configured in `vite.config.ts`:

```typescript
server: {
  port: 3000
}
```

## Features

- **Canvas Drawing**: HTML5 Canvas for high-performance rendering
- **Real-time Sync**: SignalR for instant updates
- **Shape Tools**: Rectangle, Circle, Line, Text
- **Properties Panel**: Edit shape attributes
- **User Presence**: See active users
- **Layer Management**: View and select shapes
- **Responsive Design**: Works on different screen sizes

## Technologies

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **SignalR Client** - Real-time communication
- **HTML5 Canvas API** - Drawing

## Development

### Adding New Components

1. Create component in `src/components/`
2. Add types in `src/types/index.ts` if needed
3. Import in `App.tsx`

### Styling

- Component-specific CSS: `ComponentName.css`
- Global styles: `src/index.css`
- App layout: `src/App.css`

## Troubleshooting

### Port in Use

If port 3000 is already in use, update `vite.config.ts`:

```typescript
server: {
  port: 3001  // or any available port
}
```

### Connection Issues

- Ensure backend is running on port 5000
- Check browser console for errors
- Verify SignalR connection in Network tab

### Build Errors

- Clear node_modules: `rm -rf node_modules && npm install`
- Clear cache: `rm -rf node_modules/.vite`
- Update dependencies: `npm update`

## Production Build

```bash
npm run build
```

Output will be in `dist/` directory. Serve with any static file server:

```bash
npm run preview
```

Or deploy to:
- Vercel
- Netlify
- GitHub Pages
- Azure Static Web Apps
- AWS S3 + CloudFront

## Environment Variables

Create `.env.local` for environment-specific settings:

```env
VITE_BACKEND_URL=http://localhost:5000
```

Access in code:

```typescript
const backendUrl = import.meta.env.VITE_BACKEND_URL
```
