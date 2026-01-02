import { useEffect, useRef } from "react";

export function useRipple({ selector = ".ripple", single = false } = {}) {
  const isTouchRef = useRef(false);
  const timeoutRef = useRef(0);
  const attached = useRef<Set<HTMLElement>>(new Set());
  const handlersMap = useRef<Map<HTMLElement, { handler: (e: MouseEvent | TouchEvent) => void; touchEnd: () => void }>>(new Map());
  const uid = () => Math.random().toString(36).slice(2, 9);

  useEffect(() => {
    function createRippleHandler(e: MouseEvent | TouchEvent) {
      if (e.type === "touchstart") isTouchRef.current = true;
      else if (e.type === "mousedown" && isTouchRef.current) return;

      const el = e.currentTarget as HTMLElement;

      if (!el.dataset.rid) el.dataset.rid = uid();
      if (el.querySelectorAll(".ripple-effect").length > 1) return;

      const rect = el.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const span = document.createElement("span");
      span.className = "ripple-effect";
      span.dataset.rid = el.dataset.rid;
      const color = el.dataset.rcl || "#44444440";
      const center = el.dataset.center === "true";
      span.style.width = span.style.height = `${size}px`;

      let clientX: number, clientY: number;
      if ("touches" in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ("clientX" in e && "clientY" in e) {
        clientX = e.clientX;
        clientY = e.clientY;
      } else return;

      if (center) {
        span.style.left = `${rect.width / 2 - size / 2}px`;
        span.style.top = `${rect.height / 2 - size / 2}px`;
      } else {
        span.style.top = `${clientY - rect.top - size / 2}px`;
        span.style.left = `${clientX - rect.left - size / 2}px`;
      }

      span.style.background = color;

      if (single) {
        Array.from(document.querySelectorAll(".ripple-effect")).forEach(x => {
          const hx = x as HTMLElement;
          if (hx.dataset.rid !== el.dataset.rid) hx.remove();
        });
      }

      el.appendChild(span);
      span.addEventListener("animationend", () => span.remove(), { once: true });
    }

    function attach(el: HTMLElement) {
      if (attached.current.has(el)) return;
      const handler = createRippleHandler.bind(null);
      const touchEnd = () => {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = window.setTimeout(() => {
          isTouchRef.current = false;
        }, 100);
      };
      el.addEventListener("touchstart", handler);
      el.addEventListener("mousedown", handler);
      el.addEventListener("touchend", touchEnd);
      attached.current.add(el);
      handlersMap.current.set(el, { handler, touchEnd });
    }

    function detach(el: HTMLElement) {
      const h = handlersMap.current.get(el);
      if (!h) return;
      el.removeEventListener("touchstart", h.handler);
      el.removeEventListener("mousedown", h.handler);
      el.removeEventListener("touchend", h.touchEnd);
      attached.current.delete(el);
      handlersMap.current.delete(el);
    }

    const initial = Array.from(document.querySelectorAll(selector)) as HTMLElement[];
    initial.forEach(attach);

    const observer = new MutationObserver(mutations => {
      for (const m of mutations) {
        for (const node of Array.from(m.addedNodes)) {
          if (!(node instanceof HTMLElement)) continue;
          if (node.matches(selector)) attach(node);
          const nested = node.querySelectorAll(selector);
          nested && Array.from(nested).forEach(n => attach(n as HTMLElement));
        }
        for (const node of Array.from(m.removedNodes)) {
          if (!(node instanceof HTMLElement)) continue;
          if (attached.current.has(node)) detach(node);
          const nested = node.querySelectorAll(selector);
          nested && Array.from(nested).forEach(n => attached.current.has(n as HTMLElement) && detach(n as HTMLElement));
        }
      }
    });

    observer.observe(document.documentElement || document.body, {
      childList: true,
      subtree: true
    });

    return () => {
      observer.disconnect();
      attached.current.forEach(el => detach(el));
      clearTimeout(timeoutRef.current);
    };
  }, [selector, single]);
}