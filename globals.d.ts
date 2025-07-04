export {};
declare global {
    interface Window {
      navigate: (url: string) => void;
    }
}
  