import * as THREE from 'three';

/**
 * Generates realistic human body choreography kinematics
 * simulating visitor dance movements:
 * - Arm heights (hands up/down)
 * - Arm extensions (reach out laterally)
 * - Wingspan spread (arms wide/together)
 * - Leg lifts & stance weight shifting (knee lift / ground balancing)
 * - Spine lean (sway left/right, bow front/arch back)
 * - Height factor (stretch/compress)
 * - Bloom ratio (bud vs open chalice)
 */

export const CHOREOGRAPHY_PRESETS = {
  surya: {
    id: 'surya',
    name: '☀️ Surya Namaskar (Sun Salutation)',
    duration: 10.0,
    desc: 'Deep humble bow rising into a radiant sunburst reach toward the sky',
    evaluate: (t, duration = 10.0) => {
      const p = (t % duration) / duration; // 0 to 1
      let spineLeanX = 0;
      let spineLeanZ = 0;
      let armHeightL = 0.5;
      let armHeightR = 0.5;
      let armExtensionL = 0.0;
      let armExtensionR = 0.0;
      let armStretchUp = 0.0;
      let legLiftL = 0.0;
      let legLiftR = 0.0;
      let wingspanSpread = 0.5;
      let heightFactor = 1.0;
      let bloomRatio = 0.5;
      let postureDesc = '';

      if (p < 0.28) {
        // Phase 1: Deep Forward Bow & Offering
        const prog = p / 0.28;
        const dip = Math.sin(prog * Math.PI);
        spineLeanZ = dip * 0.75; // Bow forward
        spineLeanX = Math.sin(prog * Math.PI * 2) * 0.12;
        armHeightL = 0.15 + (1 - dip) * 0.25;
        armHeightR = 0.15 + (1 - dip) * 0.25;
        armExtensionL = 0.1;
        armExtensionR = 0.1;
        wingspanSpread = 0.2;
        heightFactor = 1.0 - dip * 0.08;
        bloomRatio = 0.25 + (1 - dip) * 0.20; // Bud closes in reverence
        postureDesc = 'Humble Bow • Arms lowered, chalice resting';
      } else if (p < 0.65) {
        // Phase 2: Majestic Rise & Overhead Reaching
        const prog = (p - 0.28) / 0.37;
        const ease = 0.5 - 0.5 * Math.cos(prog * Math.PI);
        spineLeanZ = -0.32 * Math.sin(prog * Math.PI); // Gentle backward arch
        spineLeanX = Math.sin(prog * Math.PI * 1.5) * 0.18;
        armHeightL = 0.35 + ease * 0.85; // Reach high overhead
        armHeightR = 0.35 + ease * 0.85;
        armExtensionL = ease * 0.75;
        armExtensionR = ease * 0.75;
        armStretchUp = ease;
        wingspanSpread = 0.4 + ease * 0.75; // Spread arms wide
        heightFactor = 1.0 + ease * 0.28;  // Stem elongates
        bloomRatio = 0.4 + ease * 0.60;    // Petals unfurl radiant!
        postureDesc = 'Sunburst Reach • Arms high overhead, petals blooming wide';
      } else {
        // Phase 3: Radiant Glory & Gentle Return
        const prog = (p - 0.65) / 0.35;
        const easeOut = 0.5 + 0.5 * Math.cos(prog * Math.PI);
        spineLeanZ = -0.15 * easeOut;
        spineLeanX = Math.sin(prog * Math.PI * 2) * 0.15 * easeOut;
        armHeightL = 0.45 + easeOut * 0.75;
        armHeightR = 0.45 + easeOut * 0.75;
        armExtensionL = easeOut * 0.55;
        armExtensionR = easeOut * 0.55;
        wingspanSpread = 0.5 + easeOut * 0.65;
        heightFactor = 1.0 + easeOut * 0.20;
        bloomRatio = 0.55 + easeOut * 0.45;
        postureDesc = 'Radiant Glow • Lingering bloom kissing the daylight';
      }

      return {
        spineLeanX,
        spineLeanZ,
        armHeightL,
        armHeightR,
        armExtensionL,
        armExtensionR,
        armStretchUp,
        legLiftL,
        legLiftR,
        wingspanSpread,
        heightFactor,
        bloomRatio,
        postureDesc,
        progress: p
      };
    }
  },

  monsoon: {
    id: 'monsoon',
    name: '🌧️ Monsoon Sway & Wing Wave',
    duration: 8.0,
    desc: 'Spirited lateral swaying with alternating asymmetric arm dancing & leg balance',
    evaluate: (t, duration = 8.0) => {
      const omega = (2 * Math.PI) / duration;
      const phi = t * omega;

      // Dynamic side-to-side sweeping
      const spineLeanX = Math.sin(phi) * 0.65 + Math.sin(phi * 2) * 0.15;
      const spineLeanZ = Math.cos(phi * 1.5) * 0.22;

      // Asymmetric arms (one high, one low, rocking)
      const armHeightL = 0.65 + Math.sin(phi) * 0.45;
      const armHeightR = 0.65 - Math.sin(phi) * 0.45;

      const armExtensionL = 0.35 + Math.abs(Math.sin(phi)) * 0.45;
      const armExtensionR = 0.35 + Math.abs(Math.cos(phi)) * 0.45;

      // Alternating leg lift & grounded balance
      const legLiftL = Math.max(0, Math.sin(phi) * 0.42);
      const legLiftR = Math.max(0, -Math.sin(phi) * 0.42);

      // Pulsing wingspan spread
      const wingspanSpread = 0.55 + Math.sin(phi * 2) * 0.35;
      const heightFactor = 1.0 + Math.abs(Math.sin(phi)) * 0.18;
      const bloomRatio = 0.50 + Math.sin(phi * 2 + 0.5) * 0.40;

      const side = spineLeanX > 0 ? 'Right' : 'Left';
      const postureDesc = `Monsoon Sweep • Leaning ${side}, asymmetric arm wave`;

      return {
        spineLeanX,
        spineLeanZ,
        armHeightL,
        armHeightR,
        armExtensionL,
        armExtensionR,
        legLiftL,
        legLiftR,
        wingspanSpread,
        heightFactor,
        bloomRatio,
        postureDesc,
        progress: (t % duration) / duration
      };
    }
  },

  breath: {
    id: 'breath',
    name: '🧘 Prana Breath (Inhale / Exhale)',
    duration: 6.5,
    desc: 'Hypnotic meditative breathing rhythm: expanding on inhale, resting on exhale',
    evaluate: (t, duration = 6.5) => {
      const p = (t % duration) / duration;
      const wave = Math.sin(p * Math.PI * 2);
      const isExhaling = wave < 0;

      const norm = wave * 0.5 + 0.5; // 0 to 1

      const spineLeanX = Math.sin(p * Math.PI * 4) * 0.08;
      const spineLeanZ = -0.18 * norm; // Chest expands, slight back lift
      const armHeightL = 0.30 + norm * 0.70;
      const armHeightR = 0.30 + norm * 0.70;
      const armExtensionL = norm * 0.60;
      const armExtensionR = norm * 0.60;
      const armStretchUp = norm * 0.50;
      const legLiftL = 0.0;
      const legLiftR = 0.0;
      const wingspanSpread = 0.30 + norm * 0.65;
      const heightFactor = 1.0 + norm * 0.22;
      const bloomRatio = 0.25 + norm * 0.75;

      const postureDesc = isExhaling ? 'Exhale • Settling softly into the earth' : 'Inhale • Stem stretching, chalice blooming';

      return {
        spineLeanX,
        spineLeanZ,
        armHeightL,
        armHeightR,
        armExtensionL,
        armExtensionR,
        armStretchUp,
        legLiftL,
        legLiftR,
        wingspanSpread,
        heightFactor,
        bloomRatio,
        postureDesc,
        progress: p
      };
    }
  },

  spiral: {
    id: 'spiral',
    name: '🌀 Whirling Dervish Orbit',
    duration: 7.5,
    desc: 'Fluid circular orbit coupling front, side, and back motion in continuous flow',
    evaluate: (t, duration = 7.5) => {
      const omega = (2 * Math.PI) / duration;
      const phi = t * omega;

      // Circular elliptical trajectory
      const spineLeanX = Math.cos(phi) * 0.55;
      const spineLeanZ = Math.sin(phi) * 0.45;

      const armHeightL = 0.60 + Math.sin(phi * 2) * 0.35;
      const armHeightR = 0.60 + Math.cos(phi * 2) * 0.35;
      const armExtensionL = 0.45 + Math.sin(phi) * 0.35;
      const armExtensionR = 0.45 + Math.cos(phi) * 0.35;
      const legLiftL = Math.max(0, Math.sin(phi * 2) * 0.30);
      const legLiftR = Math.max(0, -Math.sin(phi * 2) * 0.30);
      const wingspanSpread = 0.75 + Math.sin(phi) * 0.25;
      const heightFactor = 1.05 + Math.sin(phi * 3) * 0.12;
      const bloomRatio = 0.70 + Math.sin(phi * 2) * 0.25;

      const postureDesc = 'Whirling Spiral • Continuous orbital dance';

      return {
        spineLeanX,
        spineLeanZ,
        armHeightL,
        armHeightR,
        armExtensionL,
        armExtensionR,
        legLiftL,
        legLiftR,
        wingspanSpread,
        heightFactor,
        bloomRatio,
        postureDesc,
        progress: (t % duration) / duration
      };
    }
  }
};
