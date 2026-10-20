"use client";

import { useSyncExternalStore } from "react";
import * as repository from "@/shared/data/clinic-repository";

export function useClinic() {
  const { appointments, services, doctors } = useSyncExternalStore(repository.subscribe, repository.getSnapshot, repository.getServerSnapshot);
  return {
    appointments,
    services,
    doctors,
    bookAppointment: repository.bookAppointment,
    cancelAppointment: repository.cancelAppointment,
    rescheduleAppointment: repository.rescheduleAppointment,
    updateService: repository.updateService,
    updateDoctor: repository.updateDoctor,
    resetDemo: repository.resetDemo,
  };
}
