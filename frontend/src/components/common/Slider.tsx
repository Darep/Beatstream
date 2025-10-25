import { useCallback, useRef } from 'react';

import styles from './Slider.module.css';

interface SliderProps {
  disabled?: boolean;

  /** Maximum value */
  max?: number;

  /** Value between 0 & max */
  value: number;

  onStart?: (event: React.PointerEvent<HTMLDivElement>) => void;
  onSlide?: (value: number) => void;
  onStop?: (value: number) => void;
}

export const Slider = ({ disabled, max = 100, onSlide, onStart, onStop, value }: SliderProps) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLSpanElement>(null);
  const thumb = thumbRef.current;

  const min = 0;
  const percentage = Math.min(value / max, 1);
  const right = `${(1 - percentage) * 100}%`;
  const thumbHalfWidth = thumb ? thumb?.clientWidth / 2 : 8;

  // offset thumb so it doesn't go off the slider
  const thumbOffset = (thumbHalfWidth - (thumbHalfWidth / 0.5) * percentage).toFixed(2);

  const updateValue = (newValue: number) => {
    if (newValue !== value) {
      onSlide?.(newValue);
    }
  };

  const getValueFromPointer = useCallback(
    (pointerPosition: number) => {
      const rect = sliderRef.current!.getBoundingClientRect();
      const value = Math.max((Math.min(pointerPosition - rect.left, rect.width) / rect.width) * max, min);
      return value;
    },
    [max, min, sliderRef],
  );

  return (
    <div
      className={styles.slider}
      onPointerDown={(event) => {
        const target = event.target as HTMLElement;
        target.setPointerCapture(event.pointerId);
        event.preventDefault();

        if (target === thumb || target?.contains(thumb)) {
          thumb?.focus();
        }
        onStart?.(event);
      }}
      onPointerMove={(event) => {
        const target = event.target as HTMLElement;
        if (target.hasPointerCapture(event.pointerId)) {
          const newValue = getValueFromPointer(event.clientX);
          updateValue(newValue);
        }
      }}
      onPointerUp={(event) => {
        const target = event.target as HTMLElement;
        if (target.hasPointerCapture(event.pointerId)) {
          target.releasePointerCapture(event.pointerId);
          const newValue = getValueFromPointer(event.clientX);
          onStop?.(newValue);
        }
      }}
      ref={sliderRef}
    >
      <span className={styles['slider-track']}>
        <span className={styles['slider-fill']} style={{ left: 0, right }} />
      </span>
      <span
        className={styles['slider-thumb']}
        ref={thumbRef}
        tabIndex={disabled ? undefined : 0}
        role="slider"
        style={{ left: `calc(${percentage * 100}% + ${thumbOffset}px)` }}
        onKeyDown={(event) => {
          let newValue = value;
          if (event.key === 'Home') {
            newValue = min;
          } else if (event.key === 'End') {
            newValue = max;
          } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
            newValue = Math.max(min, value - 1);
          } else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
            newValue = Math.min(max, value + 1);
          } else {
            return;
          }
          updateValue(newValue);
          onStop?.(newValue);

          event.preventDefault();
        }}
      />
    </div>
  );
};
