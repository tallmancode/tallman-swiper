// Animation duration constants (in milliseconds)
export const ANIMATION_DURATION = {
    FAST: 300,           // Fast animation for manual swipes
    NORMAL: 500,         // Normal animation for transitions
    SLOW: 800            // Slow animation for programmatic actions (super/down/rewind)
} as const;

// Transition timing functions
export const TRANSITION_TIMING = {
    SMOOTH: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    EASE: 'ease'
} as const;

// Card stack configuration
export const CARD_STACK = {
    INITIAL_HIDE_INDEX: 50,    // Initial z-index for hidden cards
    REWIND_DELAY_MULTIPLIER: 80 // Delay multiplier for rewind animation (in ms)
} as const;

// Swipe threshold constants
export const SWIPE_THRESHOLDS = {
    POINTER_RATIO: 0.5,      // Horizontal swipe threshold ratio
    SUPER_RATIO: 0.5,        // Vertical up swipe threshold ratio
    DOWN_RATIO: 0.5,         // Vertical down swipe threshold ratio
    WIDTH_MULTIPLIER: 0.5,   // Width multiplier for swipe distance
    ROTATION_RATIO: 0.8      // Ratio for rotation calculation
} as const;

// Rotation constants
export const ROTATION = {
    MAX_DEGREES: 15,         // Maximum rotation in degrees
    BASE_MULTIPLIER: 10      // Base rotation multiplier
} as const;

