# 🎨 Animation System Documentation

This document outlines all the micro-animations implemented throughout the Reherz application for a flawless UI/UX experience.

## 📚 Animation Utilities

All animation utilities are defined in `src/index.css` and can be used throughout the application.

### Smooth Transitions
- **`.transition-smooth`** - Standard smooth transition (300ms, ease-out)
- **`.transition-bounce`** - Bouncy transition (400ms, bounce easing)

### Entrance Animations
- **`.animate-fade-in`** - Fade in from transparent to visible
- **`.animate-slide-up`** - Slide up with fade-in effect
- **`.animate-slide-down`** - Slide down with fade-in effect  
- **`.animate-slide-left`** - Slide from right to left
- **`.animate-slide-right`** - Slide from left to right
- **`.animate-scale-in`** - Scale from 0.9 to 1.0 with fade
- **`.animate-bounce-in`** - Bouncy entrance with scale effect

### Pulse Animations
- **`.animate-pulse-subtle`** - Subtle opacity pulse (3s loop)
- **`.animate-pulse-glow`** - Glow effect with box-shadow pulse

### Hover Effects
- **`.hover-lift`** - Lifts element up 2px with shadow on hover
- **`.hover-scale`** - Scales to 105% on hover
- **`.hover-scale-sm`** - Scales to 102% on hover

### Interactive Effects
- **`.active-press`** - Scales down to 95% when active/clicked
- **`.animate-shimmer`** - Shimmer loading effect

### Stagger Delays
- **`.stagger-1`** - 50ms delay
- **`.stagger-2`** - 100ms delay
- **`.stagger-3`** - 150ms delay
- **`.stagger-4`** - 200ms delay
- **`.stagger-5`** - 250ms delay

## 🎯 Components with Animations

### Buttons (`src/components/ui/button.tsx`)
- ✅ **Active press** effect on all buttons
- ✅ **Hover scale** on primary and destructive buttons
- ✅ **Shadow lift** on hover for solid buttons
- ✅ **Border highlight** on outline variants

### Cards (`src/components/ui/card.tsx`)
- ✅ **Hover lift** effect with shadow
- ✅ **Smooth transitions** for all state changes

### Inputs (`src/components/ui/input.tsx`)
- ✅ **Smooth transitions** on all states
- ✅ **Border color change** on hover
- ✅ **Focus ring** with smooth animation

### Slider (`src/components/ui/slider.tsx`)
- ✅ **Scale up (110%)** on thumb hover
- ✅ **Scale down (95%)** on active/drag
- ✅ **Smooth range transitions**

### Dialogs/Modals (`src/components/ui/dialog.tsx`)
- ✅ **Zoom and fade** entrance animation
- ✅ **Rotate and scale** on close button hover
- ✅ **Smooth overlay fade**

## 📄 Page-Level Animations

### Index/Dashboard (`src/pages/Index.tsx`)
- ✅ **Slide-down** animation on page header
- ✅ **Slide-up** animation on chart card
- ✅ **Smooth transitions** on all interactive elements

### Recording Preferences (`src/pages/RecordingPreferences.tsx`)
- ✅ **Slide-down** on page header
- ✅ **Staggered slide-up** on cards (context upload, settings)
- ✅ **Smooth slider interactions**

### Sidebar (`src/components/AppSidebar.tsx`)
- ✅ **Staggered slide-right** on session list items
- ✅ **Bounce-in** on "New Session" button
- ✅ **Smooth hover** effects on session cards

### Camera View (`src/pages/CameraView.tsx`)
- ✅ **Loading skeleton** with fade-in
- ✅ **Smooth button transitions**

## 🎬 Loading Skeletons

All loading skeletons use the built-in **pulse animation**:
- `SessionListSkeleton` - Sidebar session loading
- `ChartSkeleton` - Dashboard chart loading
- `ScoreCardSkeleton` - Score display loading
- `CardSkeleton` - Generic card loading
- `CameraViewSkeleton` - Camera initialization
- `ContextUploadSkeleton` - File upload loading

## 💡 Best Practices

1. **Use entrance animations** for page content to create smooth page loads
2. **Apply stagger delays** to list items for sequential reveal
3. **Add hover effects** to interactive elements for feedback
4. **Use active-press** on all clickable elements
5. **Keep animations subtle** - durations between 200-500ms
6. **Combine animations** with utility classes for rich effects

## 🚀 Usage Examples

```tsx
// Entrance animation with stagger
<div className="animate-slide-up stagger-1">
  <Card>Content</Card>
</div>

// Button with hover and active effects
<Button className="hover-scale active-press">
  Click Me
</Button>

// Card with lift effect
<Card className="hover-lift transition-smooth">
  Interactive Content
</Card>

// List with staggered animations
{items.map((item, index) => (
  <div key={item.id} className={`animate-slide-right stagger-${Math.min(index + 1, 5)}`}>
    {item.content}
  </div>
))}
```

## 🎨 Performance Considerations

- All animations use **GPU-accelerated properties** (transform, opacity)
- **Cubic-bezier** easing functions for smooth motion
- **Reduced motion** support through CSS (can be extended)
- Animations are **hardware-accelerated** where possible

---

**Created:** December 2024  
**Framework:** React + TailwindCSS  
**Animation Strategy:** Utility-first with custom keyframes
