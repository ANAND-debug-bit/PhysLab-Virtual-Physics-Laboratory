// each experiment has its icon , title , description and detailed info includes about , formula , least count of the apparatus , 4 steps of doing the experiment.

const CATEGORIES = {
// 01
measurement: {
title: 'Measurement',
icon: '📏',
desc: 'Learn to use precision measuring instruments. Master the art of reading Vernier scales, screw gauges, and spherometers used in high school physics practicals.',
instruments: [

{ id: 'vernier',
icon: '📐',
title: 'Vernier Calliper',
desc: 'Measure internal, external diameters and depths with 0.1 mm precision.',
info: { about: 'A Vernier calliper is a precision instrument that can measure dimensions with an accuracy of 0.1 mm (or 0.02 mm for finer gauges). It consists of a main scale and a sliding Vernier scale.',
formula: 'Reading = MSR + (VSR × LC)',
lc: 'Least Count = 1 MSD − 1 VSD = 0.1 mm',
steps: ['Close the jaws and check zero error.',
'Place the object between the jaws.',
'Read the Main Scale Reading (MSR) — the last mark on main scale before the Vernier zero.',
'Find the Vernier Scale Reading (VSR) — which Vernier division coincides with a main scale division.',
'Apply: Total Reading = MSR + VSR × LC'
]
}
},

{ id: 'screwgauge',
icon: '🔩',
title: 'Screw Gauge',
desc: 'Measure small thicknesses and diameters with 0.01 mm (micrometer) precision.',
info: { about: 'A screw gauge (micrometer screw gauge) works on the principle of a screw and nut. One complete rotation of the thimble advances the spindle by the pitch of the screw (0.5 mm or 1 mm).',
formula: 'Reading = MSR + (CSR × LC)',
lc: 'LC = Pitch ÷ No. of divisions on thimble = 0.5/50 = 0.01 mm',
steps: [ 'Check zero error by closing the screw completely.',
'Place the object between the anvil and spindle.',
'Read the Main Scale Reading (MSR) from the main sleeve.',
'Read the Circular Scale Reading (CSR) from the thimble.',
'Apply: Total = PSR + HSR × 0.01 mm'
]
}
},

{ id: 'spherometer',
icon: '⬡',
title: 'Spherometer',
desc: 'Find the radius of curvature of curved surfaces (concave/convex).',
info: { about: 'A spherometer is used to measure the radius of curvature of a spherical surface. It has three legs forming an equilateral triangle and a central micrometer screw.',
formula: 'R = l² / (6h) + h/2',
lc: 'LC = Pitch ÷ No. of circular scale divisions = 0.01 mm',
steps: [ 'Place spherometer on a flat glass plate and note the reading h₀.',
'Place it on the curved surface and note h₁.',
'Sagitta h = h₁ - h₀ (or h₀ - h₁).',
'Measure the distance l between any two legs.',
'Calculate R = l²/6h + h/2'
]
}
}
]
},
//02
mechanics1: { title: 'Mechanics I',
icon: '⚙️',
desc: 'Explore fundamental mechanics experiments — pendulums, springs, inclined planes, and Hooke\'s Law with interactive simulations.',
instruments: [ 
{ id: 'pendulum',
icon: '🕰️',
title: 'Simple Pendulum',
desc: 'Find acceleration due to gravity (g) by measuring the time period of a simple pendulum.',
info: {
about: 'A simple pendulum consists of a heavy bob suspended from a fixed point by a light, inextensible string. The time period depends only on the length and g, not on mass or amplitude (for small angles).',
formula: 'T = 2π√(L/g)  →  g = 4π²L/T²',
lc: 'Stopwatch least count: 0.1 s',
steps: [ 'Measure effective length L (pivot to centre of bob).',
'Displace bob by < 5° and release (small angle approximation).',
'Time 20 oscillations, divide by 20 to get T.',
'Repeat for different lengths and plot L vs T².',
'Slope of L–T² graph gives g = 4π²/slope.'
]
}
},

{ id: 'spring',
icon: '🌀',
title: 'Spring-Mass System (Hooke\'s Law)',
desc: 'Verify Hooke\'s Law and find the spring constant k by plotting force vs extension.',
info: { about: 'Hooke\'s Law states that the extension of a spring is directly proportional to the applied force, within the elastic limit. The spring constant k is the slope of the F-x graph.',
formula: 'F = kx  →  k = F/x (N/m)',
lc: 'Metre scale: 1 mm',
steps: [ 'Hang the spring from a stand and note natural length.',
'Add weights in steps of 50g or 100g.',
'Note the new length after each addition.',
'Calculate extension x = new length − natural length.',
'Plot F vs x — slope = spring constant k.'
]
}
},

{ id: 'inclined',
icon: '📐',
title: 'Inclined Plane & Friction',
desc: 'Determine coefficients of static and kinetic friction using an inclined plane.',
info: { about: 'The inclined plane experiment helps determine static and kinetic friction coefficients. When a block just starts to slide, tan(θ) = μₛ (static friction coefficient).',
formula: 'μₛ = tan(θ)  |  f = μN = μmg·cosθ',
lc: 'Protractor: 1°',
steps: [ 'Place block on inclined plane.',
'Gradually increase angle θ until block starts to slide.',
'This angle is the angle of friction: μₛ = tan(θ).',
'For kinetic: push block and note angle at which it moves uniformly.'
]
}
}
]
},
//03
mechanics2: { title: 'Mechanics II',
icon: '🔧',
desc: 'Advanced mechanical property experiments — Young\'s modulus, viscosity by Stokes\' law, and surface tension.',
instruments: [
{ id: 'youngmodulus',
icon: '🔗',
title: "Young's Modulus (Searle's Method)",
desc: "Determine Young's Modulus of a wire by measuring extension under known loads.",
info: { about: "Young's Modulus is the ratio of stress to strain within the elastic limit. Searle's apparatus uses two identical wires — reference and experimental — to avoid errors due to temperature changes.",
formula: 'Y = FL / (A × ΔL)  =  FL / (πr²·ΔL)',
lc: 'Micrometer: 0.01 mm',
steps: [ 'Measure initial length L and radius r of the wire.',
'Add weights in steps; measure extension ΔL with micrometer.',
'Calculate stress = F/A = F/(πr²).',
'Calculate strain = ΔL/L.',
'Y = Stress/Strain — plot and find slope.'
]
}
},

{ id: 'stokes',
icon: '💧',
title: "Stokes' Law — Viscosity",
desc: 'Find the coefficient of viscosity of a liquid by measuring terminal velocity of falling spheres.',
info: { about: "Stokes' Law gives the drag force on a sphere moving through a viscous fluid. At terminal velocity, drag + buoyancy = weight. This gives us the viscosity coefficient η.",
formula: 'η = 2r²(ρ − σ)g / 9v',
lc: 'Stopwatch: 0.1 s, Screw gauge: 0.01 mm',
steps: [ 'Mark two horizontal lines on a graduated cylinder of glycerine.',
'Drop a sphere from above liquid surface.',
'Time the sphere between the two marks (terminal velocity section).',
'Measure radius r of sphere with screw gauge.',
'Apply Stokes\' formula to find η.'
]
}
},

{ id: 'surface',
icon: '🫧',
title: 'Surface Tension (Capillary Rise)',
desc: 'Determine surface tension of water by capillary rise method.',
info: { about: 'Liquids with high surface tension tend to rise in capillary tubes (if the liquid wets the surface). The height of rise depends on surface tension, density, and the tube radius.',
formula: 'T = rhρg / 2cosθ  (θ≈0 for water-glass: T = rh ρg/2)',
lc: 'Travelling microscope: 0.001 cm',
steps: [ 'Dip a clean capillary tube vertically in water.',
'Measure inner radius r of tube.',
'Measure capillary rise h with a travelling microscope.',
'Apply T = rhρg/2 (for water in glass, contact angle ≈ 0°).'
]
}
}
]
},
//04
waves: { title: 'Waves & Thermodynamics',
icon: '〰️',
desc: 'Experiment with sound resonance, sonometer, Newton\'s law of cooling, and specific heat calorimetry.',
instruments: [
{ id: 'resonance',
icon: '🔔',
title: 'Resonance Tube',
desc: 'Find speed of sound in air by resonance of a closed organ pipe at first and second resonance lengths.',
info: {
about: 'A resonance tube is a closed pipe. When a vibrating tuning fork is held at the open end, resonance (loudest sound) occurs when the air column length is an odd multiple of λ/4.',
formula: 'v = 2f(L₂ − L₁) | λ/4 = L₁+e, 3λ/4 = L₂+e',
lc: 'Metre scale: 1 mm',
steps: [ 'Fill the resonance tube with water to near the top.',
'Hold a vibrating tuning fork (known f) at the open end.',
'Lower the water slowly until resonance (loudest sound) — this is L₁.',
'Continue lowering until next resonance — this is L₂.',
'Speed v = 2f(L₂ − L₁).'
]
}
},

{ id: 'sonometer',
icon: '🎵',
title: 'Sonometer',
desc: 'Verify the laws of vibrating strings and find the frequency of a tuning fork.',
info: {
about: 'A sonometer (monochord) consists of a wire stretched over a soundboard. By varying tension, length, and mass per unit length, we verify the laws of transverse vibrations.',
formula: 'f = (1/2L)√(T/μ)',
lc: 'Metre scale: 1 mm',
steps: ['Stretch the wire with a known tension T (using hanging weights).',
'Adjust vibrating length L until it resonates with tuning fork.',
'Record L, T, and calculate f = (1/2L)√(T/μ).',
'Verify: f ∝ 1/L (constant T), f ∝ √T (constant L).'
]
}
},

{ id: 'cooling',
icon: '🌡️',
title: "Newton's Law of Cooling",
desc: 'Verify Newton\'s Law of Cooling by plotting temperature vs time for hot water.',
info: { about: "Newton's Law of Cooling states that the rate of cooling is proportional to the temperature difference between the body and its surroundings, for small temperature differences.",
formula: 'dT/dt = -k(T - T₀)  →  T - T₀ = (T_i - T₀)e^(-kt)',
lc: 'Thermometer: 0.5°C, Stop-watch: 0.1 s',
steps: [ 'Fill a calorimeter with hot water (~80°C).',
'Record temperature every 2 minutes as it cools.',
'Note ambient temperature T₀.',
'Plot log(T−T₀) vs time — should be a straight line.',
'Slope = −k (cooling constant).'
]
}
}
]
},
//05
optics: { title: 'Ray & Wave Optics',
icon: '🔭',
desc: 'Explore lens optics, prism spectrometers, optical benches, and interference patterns.',
instruments: [
{ id: 'lens',
icon: '🔎',
title: 'Lens Formula (Optical Bench)',
desc: 'Verify the lens formula and find the focal length of a convex lens using an optical bench.',
info: { about: 'The thin lens formula relates object distance u, image distance v, and focal length f. Using an optical bench, we can precisely measure u and v for various object positions.',
formula: '1/f = 1/v − 1/u  (sign convention: distances from lens)',
lc: 'Optical bench: 1 mm',
steps: [ 'Mount the lens at the centre of the optical bench.',
'Place illuminated object (pin/bulb) at a known distance u.',
'Find image position on the other side and note v.',
'Calculate f from 1/f = 1/v − 1/u.',
'Repeat for different u; plot 1/v vs 1/u.'
]
}
},
{ id: 'prism',
icon: '🌈',
title: 'Prism Spectrometer',
desc: 'Find refractive index of glass and angle of minimum deviation for a prism.',
info: { about: 'A prism bends light. At the angle of minimum deviation (D_m), refraction is symmetric. The refractive index n depends on the prism angle A and D_m.',
formula: 'n = sin((A+D_m)/2) / sin(A/2)',
lc: 'Spectrometer vernier: 1 arcminute',
steps: [ 'Find angle A of prism by rotating prism and noting reflected image positions.',
'Set up white light source and adjust spectrometer.',
'Rotate prism to find angle of minimum deviation D_m for each color.',
'Apply n = sin((A+D_m)/2) / sin(A/2).'
]
}
}
]
},
//06
electro: { title: 'Electrodynamics & Magnetism',
icon: '⚡',
desc: 'Hands-on circuits — Ohm\'s Law, Wheatstone Bridge, potentiometer, and galvanometer experiments.',
instruments: [ 
{ id: 'ohm',
icon: 'Ω',
title: "Ohm's Law",
desc: 'Verify Ohm\'s Law and plot V-I characteristics of a resistor.',
info: { about: "Ohm's Law states that the current through a conductor is directly proportional to the voltage across it, at constant temperature. V = IR, where R is the resistance (constant for ohmic conductors).",
formula: 'V = IR  →  R = V/I  →  Slope of V-I graph',
lc: 'Ammeter: 0.1 A, Voltmeter: 0.1 V',
steps: [ 'Connect resistor, ammeter, voltmeter, rheostat in circuit.',
'Vary rheostat to change current; note V and I at each step.',
'Plot V on Y-axis vs I on X-axis.',
'Slope of V-I graph = resistance R.',
'A straight line through origin verifies Ohm\'s Law.'
]
}
},

{ id: 'wheatstone',
icon: '🕸️',
title: 'Wheatstone Bridge',
desc: 'Find unknown resistance using a Wheatstone bridge (meter bridge).',
info: { about: 'The Wheatstone bridge uses the principle of null deflection. When the galvanometer shows zero current, the bridge is balanced: P/Q = R/S. A meter bridge is a practical form using a 1-metre resistance wire.',
formula: 'R/S = P/Q  |  S = R × Q/P  (Meter bridge: S = R(100-l)/l)',
lc: 'Metre scale: 1 mm',
steps: [ 'Connect unknown resistance S in one arm.',
'Connect known resistance R in adjacent arm.',
'Adjust the jockey along the wire until galvanometer reads zero.',
'Note balance length l from one end.',
'S = R × (100 − l) / l (meter bridge formula).'
]
}
}
]
}
};
