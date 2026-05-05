import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface TopDesktopNavigationProps {
  text: string;
  showProfile: boolean;
}

const TopDesktopNavigation: React.FC<TopDesktopNavigationProps> = ({
  text,
  showProfile,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [openpopup, setopenpopup] = useState(false);

  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);

  const toggleOpenpopup = () => {
    setopenpopup(!openpopup);
    document.body.classList.toggle("modal-open");
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setDropdownOpen(false);
    }
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      setopenpopup(false);
      document.body.classList.remove("modal-open");
    }
  };

  useEffect(() => {
    if (dropdownOpen || openpopup) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen, openpopup]);

  return (
    <>
      <div className="headerWrap">
        <div className="d-flex justify-content-between">
          <span className=""></span>
          <h2>{text}</h2>
          {showProfile ? (
            <div className="profile d-none d-lg-block"></div>
          ) : (
            <div className="profile d-none d-lg-block">
              <Link href="#" onClick={toggleOpenpopup} className="themeBtn">
                Connect Wallet
              </Link>
            </div>
          )}
        </div>
      </div>

      {openpopup && (
        <div
          className={`modal modal-backdrop ${openpopup ? "show" : ""}`}
          id="connectWalletModal"
        >
          <div className="modal-dialog modal-dialog-centered" ref={modalRef}>
            <div className="modal-content connectWalletContent">
              <button
                type="button"
                className="modal-close"
                onClick={toggleOpenpopup}
              >
                <img alt="dummy-alt" src="/images/closeIcon.svg" />
              </button>
              <div className="modal-body">
                <h3>Connect wallet</h3>
                <div className="modalBtnList">
                  <Link href="https://www.google.com/" target="_blank">
                    <img alt="dummy-alt" src="/images/gitlab.svg" /> MetaMask
                  </Link>
                  <Link href="https://www.google.com/" target="_blank">
                    <img alt="dummy-alt" src="/images/walletconnect.svg" />{" "}
                    WalletConnect
                  </Link>
                  <Link href="https://www.google.com/" target="_blank">
                    <img alt="dummy-alt" src="/images/walletlink.svg" />{" "}
                    Coinbase wallet
                  </Link>
                  <Link href="https://www.google.com/" target="_blank">
                    <img alt="dummy-alt" src="/images/phantom.svg" /> Phantom
                  </Link>
                </div>
                <p>
                  By connecting your wallet, you agree to <br /> our{" "}
                  <Link href="#">Terms of Use</Link> and{" "}
                  <Link href="#">Privacy Policy</Link>.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TopDesktopNavigation;
