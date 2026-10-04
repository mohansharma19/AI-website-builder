import { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { ArrowUp } from "lucide-react";
import { scrollToTopStyles as s } from "../assets/dummyStyles";

export default function ScrollToTop() {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname, location.hash]);
  return null;
}

export function ScrollToTopButton({ showAfter = 300 }) {
  const [visible, setVisible] = useState(false);
  const checkScroll = useCallback(() => {
    setVisible(window.pageYOffset > showAfter);
  }, [showAfter]);

  useEffect(() => {
    checkScroll();
    window.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      window.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll]);

  if (!visible) return null;
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={s.button}
    >
      <ArrowUp className={s.icon} />
    </button>
  );
}


// this component will help in opening any pages from the top