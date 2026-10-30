"use client";

import { useSyncExternalStore } from "react";
import * as repository from "@/data/clinic-repository";

export function useClinic() {
  const {
    appointments,
    services,
    doctors,
    accounts,
    intakeForms,
    treatmentPlans,
    visitSummaries,
    invoices,
  } = useSyncExternalStore(
    repository.subscribe,
    repository.getSnapshot,
    repository.getServerSnapshot
  );

  return {
    appointments,
    services,
    doctors,
    accounts,
    intakeForms,
    treatmentPlans,
    visitSummaries,
    invoices,
    bookAppointment: repository.bookAppointment,
    cancelAppointment: repository.cancelAppointment,
    rescheduleAppointment: repository.rescheduleAppointment,
    updateService: repository.updateService,
    createService: repository.createService,
    updateDoctor: repository.updateDoctor,
    createAccount: repository.createAccount,
    resetDemo: repository.resetDemo,
    getAvailableDates: repository.getAvailableDates,
    getAvailableSlots: repository.getAvailableSlots,
    getAvailableDatesForAnyDoctor: repository.getAvailableDatesForAnyDoctor,
    getAvailableSlotsForAnyDoctor: repository.getAvailableSlotsForAnyDoctor,
    confirmAppointmentAttendance: repository.confirmAppointmentAttendance,
    markAppointmentCalendarSynced: repository.markAppointmentCalendarSynced,
    canCancelAppointment: repository.canCancelAppointment,
    savePatientIntakeForm: repository.savePatientIntakeForm,
    approveTreatmentPlan: repository.approveTreatmentPlan,
    linkPhaseAppointment: repository.linkPhaseAppointment,
    payPatientInvoice: repository.payPatientInvoice,
    ensurePatientDemoAppointment: repository.ensurePatientDemoAppointment,
    getPatientIntakeForm: repository.getPatientIntakeForm,
    getPatientTreatmentPlan: repository.getPatientTreatmentPlan,
    getPatientVisitSummaries: repository.getPatientVisitSummaries,
    getPatientInvoices: repository.getPatientInvoices,
    getLastCleaningDate: repository.getLastCleaningDate,
    hydrateClinicData: repository.hydrateClinicData,
    hydrateAppointments: repository.hydrateAppointments,
    hydratePatientData: repository.hydratePatientData,
  };
}
