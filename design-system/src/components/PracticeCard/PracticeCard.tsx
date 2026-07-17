import React from 'react';
import { IconButton } from '../IconButton/IconButton';
import { Button } from '../Button/Button';
import { TextInput, TextInputProps } from '../TextInput/TextInput';
import { Badge } from '../Badge/Badge';
import './PracticeCard.css';

export interface PracticeCardProps {
  /** e.g. `"3 / 42"` */
  counter: string;
  /** e.g. `"NO.003"` */
  badge?: string;
  /** Filled dots out of 6, representing spaced-repetition mastery level. */
  masteryFilled?: number;
  favoriteActive?: boolean;
  onFavorite?: () => void;
  onNotes?: () => void;
  onRestart?: () => void;
  /** Small caption above the character row (romanization or meaning). */
  romanization?: React.ReactNode;
  /** The character row — compose from `CharacterTile`. */
  children: React.ReactNode;
  /** Shown centered under the character row when a word is completed. */
  statusText?: React.ReactNode;
  /** Typing input — hidden entirely on desktop by the consuming app; kept
   * mounted here as the mobile/soft-keyboard entry point. */
  inputProps?: TextInputProps;
  /** Small caption under the input (keyboard hint). */
  tip?: React.ReactNode;
  onPrev?: () => void;
  onNext?: () => void;
  /** @default '◀----' */
  prevLabel?: React.ReactNode;
  /** @default '----▶' */
  nextLabel?: React.ReactNode;
}

/**
 * The app's signature surface: a fixed cream "paper" card that hosts one
 * typing drill at a time — counter/badge/mastery header, icon actions,
 * the character row, status banner, mobile input, and prev/next navigation.
 */
export function PracticeCard({
  counter,
  badge,
  masteryFilled = 0,
  favoriteActive = false,
  onFavorite,
  onNotes,
  onRestart,
  romanization,
  children,
  statusText,
  inputProps,
  tip,
  onPrev,
  onNext,
  prevLabel = '◀----',
  nextLabel = '----▶',
}: PracticeCardProps) {
  return (
    <div className="tt-practice-card">
      <div className="tt-practice-card__header">
        <div>
          <div className="tt-practice-card__counter-row">
            <div className="tt-practice-card__counter">{counter}</div>
            {badge && <Badge>{badge}</Badge>}
          </div>
          <div className="tt-practice-card__mastery-dots">
            {Array.from({ length: 6 }, (_, i) => (
              <div
                key={i}
                className="tt-practice-card__dot"
                data-filled={i < masteryFilled || undefined}
              />
            ))}
          </div>
        </div>
        <div className="tt-practice-card__actions">
          <IconButton label="즐겨찾기" onClick={onFavorite} data-active={favoriteActive || undefined}>
            ★
          </IconButton>
          <IconButton label="노트" onClick={onNotes}>
            ✎
          </IconButton>
          <IconButton label="다시 시작" onClick={onRestart}>
            ↻
          </IconButton>
        </div>
      </div>

      <div className="tt-practice-card__stage">
        {romanization && <div className="tt-practice-card__romanization">{romanization}</div>}
        <div className="tt-practice-card__row">{children}</div>
        <div className="tt-practice-card__status">{statusText}</div>
        <TextInput surface="paper" centered className="tt-practice-card__input" {...inputProps} />
        {tip && <div className="tt-practice-card__tip">{tip}</div>}
      </div>

      <div className="tt-practice-card__nav">
        <Button variant="dashed" onClick={onPrev}>
          {prevLabel}
        </Button>
        <Button variant="dashed" onClick={onNext}>
          {nextLabel}
        </Button>
      </div>
    </div>
  );
}
