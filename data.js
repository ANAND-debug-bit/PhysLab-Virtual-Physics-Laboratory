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

