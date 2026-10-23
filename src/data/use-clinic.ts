"use client";

import { useSyncExternalStore } from "react";
import * as repository from "@/data/clinic-repository";

export function useClinic() {
  const { appointments, services, doctors, accounts } = useSyncExternalStore(repository.subscribe, repository.getSnapshot, repository.getServerSnapshot);
  return {
    appointments,
    services,
    doctors,
    accounts,
    bookAppointment: repository.bookAppointment,
    cancelAppointment: repository.cancelAppointment,
    rescheduleAppointment: repository.rescheduleAppointment,
    updateService: repository.updateService,
    createService: repository.createService,
    updateDoctor: repository.updateDoctor,
    createAccount: repository.createAccount,
    resetDemo: repository.resetDemo,
  };
}
