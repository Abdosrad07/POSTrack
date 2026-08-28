import React from 'react';
import { CheckIcon } from '@heroicons/react/20/solid';

/**
 * Indicateur d'étapes — formulaires complexes multi-sections
 * (création POS, reconduction, import…).
 *
 * @param {Object} props
 * @param {Array}  [props.steps]        [{ id?, label, description? }]
 * @param {number} [props.current]      Index de l'étape en cours (0-based)
 * @param {(index: number) => void} [props.onStepClick]
 * @param {string} [props.className]
 */
const Stepper = ({
  steps = /** @type {any[]} */ ([]),
  current = 0,
  onStepClick = /** @type {(index: number) => void} */ (undefined),
  className = '',
}) => (
  <ol role="list" className={`flex items-center ${className}`}>
    {steps.map((step, index) => {
      const state = index < current ? 'completed' : index === current ? 'current' : 'upcoming';
      const clickable = Boolean(onStepClick) && index <= current;
      const circleClasses = `flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-150 ${
        state === 'completed'
          ? 'border-brand-600 bg-brand-600 text-white'
          : state === 'current'
            ? 'border-brand-600 bg-white text-brand-700 ring-4 ring-brand-100'
            : 'border-slate-200 bg-slate-50 text-slate-400'
      }`;
      const circleContent =
        state === 'completed' ? (
          <CheckIcon className="h-4 w-4" aria-hidden="true" />
        ) : (
          <span className="text-xs font-bold">{index + 1}</span>
        );

      return (
        <React.Fragment key={step.id ?? step.label ?? index}>
          <li
            className="flex flex-col items-center gap-1.5 text-center"
            aria-current={state === 'current' ? 'step' : undefined}
          >
            {clickable ? (
              <button type="button" className={circleClasses} onClick={() => onStepClick(index)}>
                {circleContent}
                <span className="sr-only">{`Étape ${index + 1} : ${step.label}`}</span>
              </button>
            ) : (
              <div className={circleClasses}>{circleContent}</div>
            )}
            <span
              className={`text-xs font-semibold sm:text-sm ${
                state === 'upcoming' ? 'text-slate-400' : 'text-slate-700'
              }`}
            >
              {step.label}
            </span>
            {step.description && (
              <span className="hidden text-xs text-slate-400 sm:block">{step.description}</span>
            )}
          </li>
          {index < steps.length - 1 && (
            <div
              aria-hidden="true"
              className={`mx-2 mb-5 h-0.5 flex-1 self-start rounded-full sm:mx-3 ${
                index < current ? 'bg-brand-600' : 'bg-slate-200'
              }`}
            />
          )}
        </React.Fragment>
      );
    })}
  </ol>
);

export default Stepper;
