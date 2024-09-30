/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";

type storeType = {
  name: string;
  qna: {
    question: string;
    answer: string;
  }[];
};

// Create the store with Zustand
const useFormStore = create<storeType & { set: (e: any) => void }>((set) => ({
  name: "",
  qna: [],
  set: (e: storeType) => {
    set(e);
  },
}));

export default useFormStore;
