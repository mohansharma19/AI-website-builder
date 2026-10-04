
import React from "react";
import { footerStyles as s } from "../assets/dummyStyles";
import { Logo } from "../assets/ui";
import { Link } from "react-router-dom";

const links = [
  { label: "Features", to: "/#features" },
  { label: "Pricing", to: "/pricing" },
  { label: "Community", to: "/community" },
];

const Footer = () => {
  return (
    <footer className={s.footer}>
      <div className={s.inner}>
        <div className={s.brand}>
          <Logo />

          <p className={s.brandText}>
            Turn thoughts into websites instantly with AI.
          </p>
        </div>

        <nav className={s.nav}>
          {links.map((link) => (
            <Link
              key={link.label}
              className={s.navLink}
              to={link.to}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <p className={s.copyright}>
        &copy; 2026 mintsite. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;


