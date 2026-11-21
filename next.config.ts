import type { NextConfig } from "next";

const config: NextConfig = {
  async redirects() {
    return [{
      source: "/uploads/Emmanuel_Olivo_Resume_3d7714c515.pdf",
      destination: "/downloads/emmanuel-olivo-resume.pdf",
      permanent: true,
    }];
  },
};

export default config;
