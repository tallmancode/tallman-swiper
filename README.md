# 🎴 Tallman Swiper

> A modern, accessible card swiper component built with Vue 3 and TypeScript, inspired by popular dating app interfaces. Features smooth animations, touch gestures, keyboard navigation, and a fully customizable API.

[![Vue 3](https://img.shields.io/badge/Vue-3.4+-4FC08D?logo=vue.js&logoColor=white)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.3+-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Key Technical Highlights](#-key-technical-highlights)
- [Installation & Setup](#-installation--setup)
- [Usage](#-usage)
- [Project Structure](#-project-structure)
- [Development Details](#-development-details)
- [License & Credits](#-license--credits)

---

## 🎯 Project Overview

Tallman Swiper is a production-ready, reusable card swiper component that replicates the intuitive swipe interactions found in popular dating and discovery apps. Built from the ground up with Vue 3's Composition API and TypeScript, this project demonstrates advanced frontend development practices including:

- **Custom animation system** with configurable transitions and easing functions
- **Multi-input support** for touch, mouse, and keyboard interactions
- **Composable architecture** promoting code reusability and maintainability
- **Full TypeScript implementation** ensuring type safety across the entire codebase
- **Accessibility-first design** with ARIA labels and keyboard navigation
- **Performance optimizations** including efficient state management and event handling

### Inspiration

This project was developed to explore modern web interaction patterns and demonstrate proficiency in building complex, interactive UI components. It showcases advanced JavaScript/TypeScript skills, Vue 3 best practices, and attention to user experience details.

---

## ✨ Features

### Interaction Methods
- **🖱️ Touch Gestures**: Full support for swipe gestures on touch devices
- **🖱️ Mouse Drag**: Seamless mouse drag support for desktop users
- **⌨️ Keyboard Navigation**: Complete keyboard accessibility with arrow keys and shortcuts
  - `←` Left Arrow: Reject/Swipe Left
  - `→` Right Arrow: Like/Swipe Right
  - `↑` Up Arrow: Super Like
  - `↓` Down Arrow: Down Swipe (if enabled)
  - `Ctrl/Cmd + Z`: Undo last swipe

### Swipe Actions
- **Left Swipe** (Reject): Swipe cards to the left to reject
- **Right Swipe** (Like): Swipe cards to the right to like
- **Up Swipe** (Super Like): Optional vertical swipe for special actions
- **Down Swipe**: Optional downward swipe action
- **Undo/Rewind**: Revert the last swipe action with undo functionality

### User Experience
- **Smooth Animations**: Custom cubic-bezier transitions for natural card movements
- **Card Stack Management**: Intelligent stacking system with configurable visible cards
- **Loading States**: Elegant loading spinner during data fetch
- **Error Handling**: User-friendly error messages with retry functionality
- **Responsive Design**: Adapts seamlessly to various screen sizes
- **Visual Feedback**: Real-time card rotation and positioning during swipes

### Accessibility
- **ARIA Labels**: All interactive elements properly labeled for screen readers
- **Keyboard Navigation**: Full functionality without mouse/touch
- **Focus States**: Clear visual indicators for keyboard users
- **Semantic HTML**: Proper use of semantic elements throughout

---

## 🛠 Technology Stack

### Core Technologies
- **[Vue 3.4+](https://vuejs.org/)** - Progressive JavaScript framework with Composition API
- **[TypeScript 5.0+](https://www.typescriptlang.org/)** - Type-safe JavaScript for enhanced developer experience
- **[Vite 7.3+](https://vitejs.dev/)** - Next-generation frontend build tool for fast development

### Libraries & Tools
- **[Pexels API](https://www.pexels.com/api/)** - High-quality stock photography API
- **[Material Design Icons](https://materialdesignicons.com/)** - Icon library via `@mdi/js`
- **CSS3 Animations** - Custom keyframe animations and transitions

### Development Tools
- **vue-tsc** - TypeScript type checking for Vue SFCs
- **ESLint** (recommended) - Code linting and quality assurance

---

## 🏗 Key Technical Highlights

### Modular Architecture
The codebase follows a modular, composable architecture pattern:

- **Composables**: Reusable logic extracted into composable functions
  - `useSwiperCore`: Core swipe logic and state management
  - `useSwiperTransitions`: Animation and transition handling
  - `useSwiperTouchEvents`: Touch and mouse event management
  - `useSwiperQueue`: Card queue management and diffing
  - `usePhotos`: API integration for photo fetching

- **Component Separation**: Clear separation of concerns
  - `Swiper.vue`: Main container component with logic
  - `SwiperCard.vue`: Individual card component with animations
  - `ControlButton.vue`: Reusable button component

### TypeScript Implementation
- **100% TypeScript**: Full type coverage across the application
- **Type-safe Props**: All component props properly typed with interfaces
- **Type Imports**: Optimized imports using `import type` for better tree-shaking
- **Centralized Types**: All type definitions in `src/types.ts` for maintainability

### Animation System
- **Custom Constants**: All magic numbers extracted to `animationConstants.ts`
- **Configurable Durations**: Fast (300ms), Normal (500ms), Slow (800ms) animations
- **Easing Functions**: Smooth cubic-bezier transitions for natural motion
- **Hardware Acceleration**: Uses `translate3d` and `transform` for optimal performance

### State Management
- **Reactive State**: Leverages Vue's reactivity system efficiently
- **Computed Properties**: Optimized computed values for performance
- **Event Cleanup**: Proper cleanup of event listeners to prevent memory leaks

### Code Quality
- **No Type Suppressions**: Zero `@ts-ignore` comments - all types properly defined
- **Error Handling**: Comprehensive error handling with proper Error objects
- **Memory Leak Prevention**: Proper cleanup of timers and event listeners
- **Accessibility**: WCAG-compliant implementation with ARIA labels

---

## 🚀 Installation & Setup

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18.0 or higher recommended)
- **npm** (version 9.0 or higher) or **yarn** (version 1.22 or higher)
- A **Pexels API key** (free at [pexels.com/api](https://www.pexels.com/api/))

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-username/tallman-swiper.git
cd tallman-swiper
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and add your Pexels API key:
   ```env
   VITE_PEXEL_KEY=your_pexels_api_key_here
   ```

   To get a Pexels API key:
   - Visit [pexels.com/api](https://www.pexels.com/api/)
   - Sign up for a free account
   - Copy your API key from the dashboard

3. For production, create `.env.production` (not committed) and include:
   ```env
   VITE_PEXEL_KEY=your_pexels_api_key_here
   VITE_SENTRY_DSN=your_sentry_dsn_here
   # Optional:
   # VITE_SENTRY_ENV=production
   # VITE_COMMIT_SHA=main@abc123
   ```
   Sentry initializes only in production builds (`import.meta.env.PROD`) when `VITE_SENTRY_DSN` is set; otherwise it stays disabled.

### Step 4: Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the port shown in the terminal).

### Build for Production

```bash
npm run build
```

The production build will be output to the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

---

## 📖 Usage

### Basic Implementation

The Swiper component accepts an array of items and renders them as swipeable cards:

```vue
<script setup lang="ts">
import Swiper from '~/components/Swiper.vue'
import { ref } from 'vue'
import type { IPhoto } from '~/types'

const items = ref<IPhoto[]>([
  {
    id: '1',
    src: 'https://example.com/image.jpg',
    credits: {
      name: 'Photographer Name',
      link: 'https://example.com/photographer'
    }
  }
  // ... more items
])
</script>

<template>
  <Swiper
    key-name="id"
    :items-list="items"
    :max="3"
    :offset-y="10"
    allow-down
  >
    <template #default="scope">
      <div class="card-content">
        <img :src="scope.data.src" :alt="scope.data.credits.name">
        <p>Photo by {{ scope.data.credits.name }}</p>
      </div>
    </template>
  </Swiper>
</template>
```

### Component Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `itemsList` | `IPhoto[]` | **required** | Array of items to display as cards |
| `keyName` | `string` | `'key'` | Property name used as unique key for each item |
| `max` | `number` | `3` | Maximum number of visible cards in the stack |
| `offsetY` | `number` | `0` | Vertical offset between stacked cards |
| `offsetUnit` | `string` | `'px'` | Unit for offsetY (px, rem, em, etc.) |
| `scaleStep` | `number` | `0.05` | Scale reduction factor for each card in stack |
| `allowSuper` | `boolean` | `true` | Enable upward swipe (super like) action |
| `allowDown` | `boolean` | `false` | Enable downward swipe action |
| `pointerThreshold` | `number` | `0.5` | Horizontal swipe threshold ratio (0-1) |
| `superThreshold` | `number` | `0.5` | Vertical up swipe threshold ratio (0-1) |
| `downThreshold` | `number` | `0.5` | Vertical down swipe threshold ratio (0-1) |
| `sync` | `boolean` | `false` | Synchronize state transitions |

### Slots

- **`default`**: The main content slot for each card
  - Slot props: `data`, `index`, `status`

### Component Methods (via ref)

```vue
<script setup lang="ts">
import { ref } from 'vue'
import Swiper from '~/components/Swiper.vue'

const swiperRef = ref<InstanceType<typeof Swiper>>()

// Programmatically trigger actions
swiperRef.value?.decide('like')    // Swipe right
swiperRef.value?.decide('nope')    // Swipe left
swiperRef.value?.decide('super')   // Super like
swiperRef.value?.decide('rewind')  // Undo last swipe
</script>
```

---

## 📁 Project Structure

```
tallman-swiper/
│
├── src/
│   ├── components/          # Vue components
│   │   ├── Swiper.vue      # Main swiper container component
│   │   ├── SwiperCard.vue  # Individual card component
│   │   └── ControlButton.vue # Reusable button component
│   │
│   ├── composables/        # Composable functions
│   │   └── usePhotos.ts    # Pexels API integration
│   │
│   ├── utils/              # Utility functions and logic
│   │   ├── animationConstants.ts  # Animation configuration
│   │   ├── statusConstants.ts     # Status constants
│   │   ├── swiperConfig.ts        # Global swiper configuration
│   │   ├── swiperCore.ts          # Core swipe logic
│   │   ├── swiperQueue.ts         # Queue management
│   │   ├── swiperState.ts         # State initialization
│   │   ├── swiperTouchEvents.ts   # Touch/mouse event handlers
│   │   └── swiperTransitions.ts   # Animation transitions
│   │
│   ├── types.ts            # TypeScript type definitions
│   ├── App.vue             # Root component
│   ├── main.ts             # Application entry point
│   └── style.css           # Global styles
│
├── public/                 # Static assets
├── .env.example           # Environment variables template
├── index.html             # HTML template
├── package.json           # Project dependencies
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite configuration
└── README.md              # This file
```

### Architecture Overview

The application follows a **composable-based architecture**:

1. **Components** (`src/components/`): Presentation layer
   - Handle UI rendering and user interactions
   - Use composables for business logic

2. **Composables** (`src/composables/`): Business logic layer
   - Reusable functions with Vue reactivity
   - Handle API calls and data fetching

3. **Utils** (`src/utils/`): Core functionality layer
   - Self-contained modules for specific features
   - Manage state, events, animations, and transitions

4. **Types** (`src/types.ts`): Type definitions
   - Centralized TypeScript interfaces and types
   - Ensures type safety across the application

---

## 🔧 Development Details

### Code Quality Features

- ✅ **TypeScript Strict Mode**: Full type checking enabled
- ✅ **No Type Suppressions**: Zero `@ts-ignore` or `@ts-expect-error` comments
- ✅ **Linting**: ESLint configured for code quality
- ✅ **Error Handling**: Comprehensive error handling with proper Error objects
- ✅ **Memory Management**: Proper cleanup of timers and event listeners
- ✅ **Code Organization**: Modular structure with clear separation of concerns

### Accessibility Considerations

- **ARIA Labels**: All interactive elements labeled for screen readers
- **Keyboard Navigation**: Full functionality accessible via keyboard
- **Focus Management**: Visible focus indicators for keyboard users
- **Semantic HTML**: Proper use of semantic elements
- **Color Contrast**: Sufficient contrast ratios for readability

### Performance Optimizations

- **Type Imports**: Uses `import type` for type-only imports (better tree-shaking)
- **Computed Properties**: Efficient reactive computations
- **Event Debouncing**: Resize events debounced to prevent excessive updates
- **Hardware Acceleration**: CSS transforms leverage GPU acceleration
- **Lazy Loading**: Images and resources loaded efficiently
- **Bundle Optimization**: Vite's optimized build process

### Browser Support

- Modern browsers with ES2020 support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## 📄 License & Credits

### License

This project is open source and available under the [MIT License](LICENSE).

### Credits

- **Photos**: Provided by [Pexels](https://www.pexels.com/) - Free stock photos
- **Icons**: [Material Design Icons](https://materialdesignicons.com/)
- **Built with**: [Vue.js](https://vuejs.org/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)

### Acknowledgments

- Inspired by modern card-swiping interfaces found in dating and discovery apps
- Built with modern web development best practices and accessibility in mind

---

## 👤 Author

**TallmanCode**

- GitHub: [@tallmancode](https://github.com/tallmancode)
- Portfolio: [tallmancode.co.za](https://tallmancode.co.za)
- LinkedIn: [Steve Stewart](https://www.linkedin.com/in/stevestewart84)

---

<div align="center">

**⭐ If you find this project helpful, please consider giving it a star! ⭐**

Made with ❤️ using Vue 3 and TypeScript

</div>
