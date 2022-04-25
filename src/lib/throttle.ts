export default function throttle(callback: (...args: any[]) => void, delay: number) {
  var waiting = false;
  return function (...args: []) {
    if (!waiting) {
      callback.apply(this, args);
      waiting = true;
      setTimeout(function () {
        waiting = false;
      }, delay);
    }
  };
}
