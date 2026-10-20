"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

const questions = [
  ["Can I book an appointment on this website?", "Not yet. This is a preview of the booking experience. The search does not show live availability, send a request, or confirm an appointment. Booking will be available after clinic schedules and contact details are confirmed."],
  ["What if I do not know which treatment I need?", "You can start with a question or concern rather than a treatment name. Discuss it with the dental team so they can advise which appointment is appropriate. This preview cannot assess symptoms or recommend a treatment."],
  ["What happens during a routine check-up?", "Your dentist will usually examine your teeth, gums, and mouth, discuss your oral health, and explain any recommended next steps. What happens at your appointment depends on your needs and the clinic."],
  ["Can I see the dentists and choose who I visit?", "The team names shown are fictional examples for this design preview. They are not verified clinician profiles, and there is no live appointment availability or clinician selection yet."],
  ["How much will my visit cost?", "Prices and payment arrangements have not been supplied. Confirm the consultation fee, any proposed treatment costs, and insurance arrangements directly with the clinic before agreeing to care."],
  ["What if I need urgent dental care?", "This preview cannot arrange urgent care or monitor requests. Contact an available local dental practice or your local urgent dental service directly."],
];

export function BookingFaq() {
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);

  return (
    <section aria-labelledby="faq-title" className="mx-auto grid w-full max-w-none scroll-mt-28 gap-8 px-5 py-14 sm:px-8 sm:py-20 md:grid-cols-12 lg:px-12 lg:py-24 2xl:px-16" data-reveal="section" id="faq">
      <div className="md:col-span-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Good to know</p>
        <h2 className="mt-4 text-3xl font-bold leading-[1.05] tracking-[-0.05em] sm:text-5xl" id="faq-title">Questions,<br />answered.</h2>
        <p className="mt-5 max-w-xs text-sm leading-7 text-muted-foreground">A clearer picture of your visit starts with the basics.</p>
      </div>
      <div className="overflow-hidden rounded-[24px] border border-brand-border bg-card px-5 shadow-sm md:col-span-7 md:col-start-6 sm:px-7" data-reveal="card">
        {questions.map(([question, answer], index) => {
          const answerId = `faq-answer-${index}`;
          const isOpen = openQuestion === question;

          return (
          <div className="border-b border-brand-border last:border-b-0" key={question}>
            <button
              aria-controls={answerId}
              aria-expanded={isOpen}
              className="flex min-h-16 w-full items-center justify-between gap-5 py-5 text-left text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => setOpenQuestion(isOpen ? null : question)}
              type="button"
            >
              {question}
              <Plus aria-hidden="true" className={`size-5 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-45" : ""} motion-reduce:transition-none`} />
            </button>
            <div className="faq-answer" aria-hidden={!isOpen} data-open={isOpen} id={answerId}>
              <div className="faq-answer-inner">
                <p className="max-w-xl pb-6 pr-8 text-sm leading-7 text-muted-foreground">{answer}</p>
              </div>
            </div>
          </div>
          );
        })}
      </div>
    </section>
  );
}
