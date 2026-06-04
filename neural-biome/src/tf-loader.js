const TFJS_URL = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js';

let tfPromise = null;

export function loadTensorFlow() {
  if (globalThis.tf) return Promise.resolve(globalThis.tf);
  if (tfPromise) return tfPromise;

  tfPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = TFJS_URL;
    script.async = true;
    script.onload = () => {
      if (globalThis.tf) resolve(globalThis.tf);
      else reject(new Error('TF.js loaded but did not expose window.tf.'));
    };
    script.onerror = () => reject(new Error(`Failed to load TF.js from ${TFJS_URL}`));
    document.head.appendChild(script);
  });

  return tfPromise;
}
