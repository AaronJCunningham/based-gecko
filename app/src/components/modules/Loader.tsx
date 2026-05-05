"use client";

import SVGAnimatedLogo from "../svg/SVGAnimatedLogo";

const Loader: React.FC = () => (
  <div className="fixed inset-0 bg-black flex items-center justify-center">
    <SVGAnimatedLogo className="w-32 h-32" />
  </div>
);

export default Loader;
