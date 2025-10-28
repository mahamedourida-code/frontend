"use client"

import { useEffect, useMemo, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { type Container, type ISourceOptions } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";

export default function ParticlesBackground() {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesLoaded = async (container?: Container): Promise<void> => {
    console.log(container);
  };

  const options: ISourceOptions = useMemo(
    () => ({
      background: {
        color: {
          value: "transparent",
        },
      },
      fpsLimit: 120,
      interactivity: {
        events: {
          onClick: {
            enable: true,
            mode: "push",
          },
          onHover: {
            enable: false,
            mode: "grab",
          },
          resize: {
            enable: true,
          },
        },
        modes: {
          push: {
            quantity: 4,
          },
          grab: {
            distance: 400,
          },
          repulse: {
            distance: 200,
            duration: 0.4,
          },
        },
      },
      particles: {
        color: {
          value: "#b65c23",
        },
        links: {
          enable: false,
        },
        move: {
          direction: "none",
          enable: true,
          outModes: {
            default: "out",
          },
          random: false,
          speed: 8,
          straight: false,
        },
        number: {
          density: {
            enable: true,
            width: 800,
            height: 800,
          },
          value: 5,
        },
        opacity: {
          value: 0.3038784486205519,
          random: true,
          animation: {
            enable: false,
            speed: 1,
            minimumValue: 0.1,
            sync: false,
          },
        },
        shape: {
          type: "polygon",
          polygon: {
            sides: 6,
          },
        },
        size: {
          value: 7.996801279488208,
          random: false,
          animation: {
            enable: true,
            speed: 10,
            minimumValue: 40,
            sync: false,
          },
        },
      },
      detectRetina: true,
    }),
    [],
  );

  if (init) {
    return (
      <Particles
        id="tsparticles"
        particlesLoaded={particlesLoaded}
        options={options}
        className="absolute inset-0 z-0"
      />
    );
  }

  return null;
}
