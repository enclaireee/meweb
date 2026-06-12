"use client";

import { useId, useState, type FormEvent } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { DUR, EASE } from "@/lib/motion";

type Status = "idle" | "sending" | "sent";

interface Values {
  name: string;
  email: string;
  message: string;
}

const empty: Values = { name: "", email: "", message: "" };

function validate(values: Values): Partial<Record<keyof Values, string>> {
  const errors: Partial<Record<keyof Values, string>> = {};
  if (!values.name.trim()) errors.name = "a name helps me reply properly";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))
    errors.email = "that address doesn't parse";
  if (values.message.trim().length < 10)
    errors.message = "a few more words — what are we building?";
  return errors;
}

/**
 * The transmission form. Floating labels, hairline focus draw, inline
 * validation in the annot voice, and a designed success state.
 *
 * [NEEDS REVIEW] No send endpoint is wired yet — submit currently simulates
 * a send (1.2s) and shows the success state. Point `submitMessage` at a
 * real service (Resend, Formspree, an API route…) when one exists.
 */
async function submitMessage(values: Values): Promise<void> {
  void values; // not transmitted anywhere yet — see [NEEDS REVIEW] above
  await new Promise((r) => setTimeout(r, 1200));
}

export function ContactForm() {
  const uid = useId();
  const reduced = useReducedMotion();
  const [values, setValues] = useState<Values>(empty);
  const [touched, setTouched] = useState<Partial<Record<keyof Values, boolean>>>({});
  const [status, setStatus] = useState<Status>("idle");

  const errors = validate(values);
  const showError = (field: keyof Values) =>
    touched[field] && errors[field] ? errors[field] : undefined;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, message: true });
    if (Object.keys(errors).length > 0 || status === "sending") return;
    setStatus("sending");
    await submitMessage(values);
    setStatus("sent");
  };

  const reset = () => {
    setValues(empty);
    setTouched({});
    setStatus("idle");
  };

  const fade = reduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -12 },
      };

  return (
    <div className="relative border border-border bg-background/70 p-8 backdrop-blur-[2px] sm:p-10">
      <AnimatePresence mode="wait" initial={false}>
        {status === "sent" ? (
          <motion.div
            key="sent"
            role="status"
            className="flex min-h-80 flex-col items-start justify-center"
            {...fade}
            transition={{ duration: DUR.base, ease: EASE.outExpo }}
          >
            <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
              <circle
                cx="20"
                cy="20"
                r="18.5"
                fill="none"
                stroke="var(--color-border)"
                strokeWidth="1"
              />
              <motion.path
                d="M12 20.5 L17.5 26 L28 14.5"
                fill="none"
                stroke="var(--color-accent)"
                strokeWidth="2"
                initial={{ pathLength: reduced ? 1 : 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: DUR.gesture, ease: EASE.outExpo, delay: 0.1 }}
              />
            </svg>
            <p className="font-display text-heading mt-6">Transmission received.</p>
            <p className="mt-2 max-w-sm text-muted">
              Thanks for writing — I read everything and usually reply within a day or two.
            </p>
            <button
              type="button"
              onClick={reset}
              className="annot mt-8 text-muted underline decoration-border underline-offset-4 transition-colors duration-150 hover:text-foreground"
            >
              send another
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={onSubmit}
            noValidate
            {...fade}
            transition={{ duration: DUR.base, ease: EASE.outExpo }}
          >
            <p className="annot text-muted">direct line</p>

            <Field
              id={`${uid}-name`}
              label="Name"
              value={values.name}
              error={showError("name")}
              onChange={(v) => setValues((s) => ({ ...s, name: v }))}
              onBlur={() => setTouched((s) => ({ ...s, name: true }))}
            />
            <Field
              id={`${uid}-email`}
              label="Email"
              type="email"
              value={values.email}
              error={showError("email")}
              onChange={(v) => setValues((s) => ({ ...s, email: v }))}
              onBlur={() => setTouched((s) => ({ ...s, email: true }))}
            />
            <Field
              id={`${uid}-message`}
              label="Message"
              textarea
              value={values.message}
              error={showError("message")}
              onChange={(v) => setValues((s) => ({ ...s, message: v }))}
              onBlur={() => setTouched((s) => ({ ...s, message: true }))}
            />

            <button
              type="submit"
              disabled={status === "sending"}
              data-cursor="send"
              className="group mt-10 inline-flex w-full items-center justify-between border border-foreground bg-foreground px-6 py-4 font-display text-lead text-background transition-colors duration-300 hover:border-accent hover:bg-accent disabled:cursor-wait disabled:opacity-70"
            >
              <span>{status === "sending" ? "Transmitting" : "Transmit"}</span>
              <span aria-hidden="true">
                {status === "sending" ? (
                  <motion.span
                    className="inline-block"
                    animate={reduced ? {} : { opacity: [1, 0.3, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  >
                    ···
                  </motion.span>
                ) : (
                  <span className="inline-block transition-transform duration-300 ease-(--ease-out-expo) group-hover:translate-x-1.5">
                    →
                  </span>
                )}
              </span>
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

interface FieldProps {
  id: string;
  label: string;
  value: string;
  error?: string;
  type?: string;
  textarea?: boolean;
  onChange: (value: string) => void;
  onBlur: () => void;
}

/**
 * Floating-label field: the label rests in the input and lifts to the annot
 * voice on focus or content (pure CSS peer states — works under reduced
 * motion and without JS). An accent hairline draws across on focus.
 */
function Field({ id, label, value, error, type = "text", textarea, onChange, onBlur }: FieldProps) {
  const shared =
    "peer w-full bg-transparent pb-2 pt-7 text-foreground outline-none placeholder-transparent";

  return (
    <div className="relative mt-2">
      {textarea ? (
        <textarea
          id={id}
          rows={4}
          placeholder={label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`${shared} resize-none`}
        />
      ) : (
        <input
          id={id}
          type={type}
          placeholder={label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={shared}
        />
      )}
      <label
        htmlFor={id}
        className="annot pointer-events-none absolute left-0 top-1.5 text-muted transition-all duration-300 ease-(--ease-out-expo) peer-placeholder-shown:top-7 peer-placeholder-shown:text-sm peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:top-1.5 peer-focus:text-(length:--text-caption) peer-focus:uppercase peer-focus:tracking-[0.1em]"
      >
        {label}
      </label>

      {/* resting hairline + accent focus draw */}
      <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px bg-border" />
      <span
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-accent transition-transform duration-300 ease-(--ease-out-expo) peer-focus:scale-x-100"
      />

      <p
        id={`${id}-error`}
        role="alert"
        className={`annot mt-1.5 min-h-4 text-accent transition-opacity duration-150 ${
          error ? "opacity-100" : "opacity-0"
        }`}
      >
        {error ?? ""}
      </p>
    </div>
  );
}
