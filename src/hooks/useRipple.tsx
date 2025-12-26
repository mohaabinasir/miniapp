import { useEffect, useRef } from "react";

export function useRipple({ selector = ".ripple", single = false } = {}) {
  const isTouchRef = useRef(false);
  const timeoutRef = useRef(0);
  const attached = useRef(new Set());
  const handlersMap = useRef(new Map());
  const uid = () => Math.random().toString(36).slice(2, 9);

  useEffect(() => {
    function createRippleHandler(e) {
      if (e.type === "touchstart") isTouchRef.current = true;
      else if (e.type === "mousedown" && isTouchRef.current) return;

      const el = e.currentTarget;

      if (!el.dataset.rid) {
        el.dataset.rid = uid();
      }      
      
      if (el.querySelectorAll(".ripple-effect").length > 1) return;

      const rect = el.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const span = document.createElement("span");
      span.className = "ripple-effect";

      span.dataset.rid = el.dataset.rid;
      const color = el.dataset.rcl || '#44444440';
      const dur = el.dataset.dur || '0.7s';
      const center = el.dataset.center === "true";

      span.style.width = span.style.height = `${size}px`;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      
      if (center) {
         span.style.left = `${rect.width / 2 - size / 2}px`;
         span.style.top = `${rect.height / 2 - size / 2}px`;
      } else {
      span.style.top = `${clientY - rect.top - size / 2}px`;
      span.style.left = `${clientX - rect.left - size / 2}px`;
      }
      span.style.background = color;

      if (single) {
        const existing = document.querySelectorAll(".ripple-effect");
        existing.forEach(x => {
          if (x.dataset.rid !== el.dataset.rid) x.remove();
        });
      }

      el.appendChild(span);

      span.addEventListener("animationend", () => span.remove(), { once: true });
    }

    function attach(el) {
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

    function detach(el) {
      const h = handlersMap.current.get(el);
      if (!h) return;
      el.removeEventListener("touchstart", h.handler);
      el.removeEventListener("mousedown", h.handler);
      el.removeEventListener("touchend", h.touchEnd);
      handlersMap.current.delete(el);
      attached.current.delete(el);
    }

    const initial = Array.from(document.querySelectorAll(selector));
    initial.forEach(attach);

    const observer = new MutationObserver(mutations => {
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (!(node instanceof Element)) continue;
          if (node.matches && node.matches(selector)) attach(node);
          const nested = node.querySelectorAll && node.querySelectorAll(selector);
          nested && nested.forEach(attach);
        }
        for (const node of m.removedNodes) {
          if (!(node instanceof Element)) continue;
          if (attached.current.has(node)) detach(node);
          const nested = node.querySelectorAll && node.querySelectorAll(selector);
          nested && nested.forEach(n => attached.current.has(n) && detach(n));
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
