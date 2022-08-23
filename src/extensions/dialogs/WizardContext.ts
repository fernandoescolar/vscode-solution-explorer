
export type WizardContext = {
    title: string;
    step: number;
    totalSteps: number;
    cancelled: boolean;
    results: string[];
    prev: () => void;
    next: () => void;
    cancel: () => void;
};
