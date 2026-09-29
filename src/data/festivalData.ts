import type { FestivalConfig, CulturalCategory, SportsEvent, VenueInfo } from '../types';

/**
 * ============================================================================
 * CENTRALIZED FESTIVAL CONFIGURATION — COLORIDO 2K26
 * ============================================================================
 * Everything that is likely to change is kept in this centralized file.
 * Official information will replace placeholder brackets when finalized.
 */

export const festivalConfig: FestivalConfig = {
  name: 'COLORIDO 2K26',
  collegeName: 'RVR & JC College of Engineering',
  collegeShort: 'RVRJC',
  tagline: 'Your Stage. Your Game. Your COLORIDO.',
  aboutText:
    'A celebration of creativity, talent, competition, and campus spirit at RVR & JC College of Engineering. Bringing together extraordinary artistic performances and high-octane sports competition across our vibrant campus.',
  dates: '[OFFICIAL DATE TO BE UPDATED]',
  registrationFeeNotice: 'NO REGISTRATION FEE',
  announcementTickerText:
    'NO REGISTRATION FEE • COLORIDO 2K26 • [OFFICIAL DATE TO BE UPDATED] • REGISTER NOW • RVR & JC COLLEGE OF ENGINEERING • CULTURAL & SPORTS EXTRAVAGANZA •',
  
  // Real Assets
  posterAsset: '/assets/colorido_2k25.jpg',
  collegeBackgroundAsset: '/assets/rvrjc.jpg',
  collegeLogoAsset: '/assets/rvr_logo.jpg',

  // Official college address & map location
  address: 'R.V.R. & J.C. College of Engineering, Chandramoulipuram, Chowdavaram, Guntur, Andhra Pradesh 522019',
  googleMapsUrl: 'https://maps.google.com/?q=R.V.R.+%26+J.C.+College+of+Engineering+Chowdavaram+Guntur',
  contactDetails: 'conveners@rvrjc.ac.in',
  socialLinks: {
    instagram: 'https://www.instagram.com/rvrjcce.official?stkn=MThhMmRoYTRrejdxag==',
    youtube: 'https://youtube.com/@rvrjccollegeofengineering?si=ScO1g6PeCDa6g-Jx',
    twitter: 'https://x.com/rvrjc_official',
    facebook: 'https://facebook.com/rvrjcce',
    email: 'colorido2k26@rvrjc.ac.in',
  },

  // Registration via in-website form
  registrationInfo: 'All registrations are handled directly inside the COLORIDO 2K26 website. No external forms required.',
};

/**
 * ============================================================================
 * CULTURAL CATEGORIES & EVENTS
 * ============================================================================
 * 6 Categories with 3D hotspot coordinates on the OAT model:
 * 1. DANCE
 * 2. MUSIC
 * 3. FINE ARTS
 * 4. LITERARY
 * 5. DRAMATIC
 * 6. FASHION
 */
export const culturalCategories: CulturalCategory[] = [
  {
    id: 'dance',
    name: 'DANCE',
    subtitle: 'Rhythm, Power & Expressive Movement',
    description:
      'Step onto the premier RVRJC OAT stage to showcase electrifying choreography, classical heritage, and contemporary sync.',
    iconName: 'Flame',
    hotspotPosition: [0, 1.45, -2.2], // Main Stage Center
    cameraPosition: [0, 3.5, 6],
    hotspotLabel: 'Main Stage Center — Dance Spotlight',
    events: [
      {
        id: 'western-group-dance',
        name: 'Western Group Dance',
        category: 'DANCE',
        tagline: 'High-octane synchronization & beat drops',
        date: '[OFFICIAL DATE TO BE UPDATED]',
        time: '[TIMINGS TO BE ANNOUNCED]',
        venue: 'RVRJC OAT (Open Air Theatre)',
        teamSize: '6 - 15 Members',
        shortDescription:
          'Showcase team synergy, energetic transitions, and dynamic formations under the open-air stage lights.',
        registrationFee: 'FREE',
        registrationType: 'cultural',
        colorScheme: 'from-purple-600 to-pink-600',
        rules: [
          {
            title: 'Time Limit',
            points: [
              'Performance time: 6 to 8 minutes (maximum 10 minutes including stage setup).',
              'Exceeding the time limit may lead to point deductions by the jury.',
            ],
          },
          {
            title: 'Music & Track Submission',
            points: [
              'Audio tracks must be submitted in MP3 format via pen drive / form submission at least 2 hours prior to event.',
              'No obscenity or vulgarity in lyrics or choreography.',
            ],
          },
          {
            title: 'Props & Costumes',
            points: [
              'Props are allowed with prior notification to the event coordinators.',
              'Use of fire, hazardous materials, or liquid stage spill is strictly prohibited.',
            ],
          },
        ],
      },
      {
        id: 'classical-solo-dance',
        name: 'Classical / Folk Solo',
        category: 'DANCE',
        tagline: 'Grace, Natya & Traditional Expressions',
        date: '[OFFICIAL DATE TO BE UPDATED]',
        time: '[TIMINGS TO BE ANNOUNCED]',
        venue: 'RVRJC OAT (Open Air Theatre)',
        teamSize: 'Individual Solo',
        shortDescription:
          'Celebrate rich Indian heritage through Bharatnatyam, Kuchipudi, Kathak, or authentic folk expressions.',
        registrationFee: 'FREE',
        registrationType: 'cultural',
        colorScheme: 'from-purple-700 to-amber-500',
        rules: [
          {
            title: 'Performance Duration',
            points: [
              'Duration: 4 to 6 minutes.',
              'Judging criteria: Bhava (expression), Raga, Tala, and stage utilization.',
            ],
          },
          {
            title: 'Costume & Accompaniment',
            points: [
              'Traditional attire appropriate for the chosen dance form is mandatory.',
              'Recorded accompaniment audio must be clear and checked during reporting.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'music',
    name: 'MUSIC',
    subtitle: 'Vocal Harmony, Acoustic & Battle of Bands',
    description:
      'Let your melodies echo under the RVRJC canopy. From acoustic soulful vocals to powerful live instrumental rhythm.',
    iconName: 'Music',
    hotspotPosition: [-3.6, 0.85, 0.1], // Left Pathway
    cameraPosition: [-4, 3, 6],
    hotspotLabel: 'Left Pathway — Acoustic & Band Wing',
    events: [
      {
        id: 'battle-of-bands',
        name: 'Battle of the Bands',
        category: 'MUSIC',
        tagline: 'Live electric amplifiers and heart-thumping beats',
        date: '[OFFICIAL DATE TO BE UPDATED]',
        time: '[TIMINGS TO BE ANNOUNCED]',
        venue: 'RVRJC OAT (Open Air Theatre)',
        teamSize: '3 - 8 Members',
        shortDescription:
          'Unleash rock, fusion, or pop arrangements in front of an energetic amphitheatre crowd.',
        registrationFee: 'FREE',
        registrationType: 'cultural',
        colorScheme: 'from-indigo-600 to-purple-600',
        rules: [
          {
            title: 'Stage & Performance Time',
            points: [
              'Total slot: 15 minutes (10 min performance + 5 min setup/soundcheck).',
              'Drum kit and standard P.A. system will be provided on stage.',
            ],
          },
          {
            title: 'Instruments',
            points: [
              'Bands must bring their own guitars, keyboards, pedals, and drumsticks.',
              'Backing tracks with pre-recorded vocals or main leads are not permitted.',
            ],
          },
        ],
      },
      {
        id: 'solo-vocals',
        name: 'Solo Vocals (Western / Eastern)',
        category: 'MUSIC',
        tagline: 'Melody, Pitch & Pitch-perfect resonance',
        date: '[OFFICIAL DATE TO BE UPDATED]',
        time: '[TIMINGS TO BE ANNOUNCED]',
        venue: 'RVRJC OAT (Open Air Theatre)',
        teamSize: 'Individual Solo',
        shortDescription:
          'Individual singing showcase across classical, film, indie, or Western pop categories.',
        registrationFee: 'FREE',
        registrationType: 'cultural',
        colorScheme: 'from-fuchsia-600 to-purple-800',
        rules: [
          {
            title: 'Time Limit',
            points: ['Performance: 3 to 5 minutes max.'],
          },
          {
            title: 'Backing & Accompaniment',
            points: [
              'Karaoke track or one acoustic instrument accompanist allowed.',
              'Judged on pitch accuracy, voice modulation, and stage confidence.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'fine-arts',
    name: 'FINE ARTS',
    subtitle: 'Canvas, Graffiti, Sketching & Creativity',
    description:
      'Immerse in vibrant pigments, canvas storytelling, charcoal textures, and expressive artwork around the OAT concourse.',
    iconName: 'Palette',
    hotspotPosition: [3.6, 0.85, 0.1], // Right Pathway
    cameraPosition: [5, 3.5, 6],
    hotspotLabel: 'Right Pathway — Visual Arts & Canvas Arena',
    events: [
      {
        id: 'live-canvas-painting',
        name: 'Live Canvas Painting',
        category: 'FINE ARTS',
        tagline: 'Brush strokes inspired by festival themes',
        date: '[OFFICIAL DATE TO BE UPDATED]',
        time: '[TIMINGS TO BE ANNOUNCED]',
        venue: 'RVRJC OAT (Open Air Theatre Concourse)',
        teamSize: 'Individual or Duo',
        shortDescription:
          'Create an original artistic painting on canvas based on the live theme announced on the spot.',
        registrationFee: 'FREE',
        registrationType: 'cultural',
        colorScheme: 'from-pink-600 to-rose-500',
        rules: [
          {
            title: 'Event Duration & Theme',
            points: [
              'Duration: 2 Hours.',
              'Theme will be announced 15 minutes before the competition starts.',
            ],
          },
          {
            title: 'Materials',
            points: [
              'Standard canvas sheet will be provided by organizers.',
              'Participants must bring their own colors, brushes, and palettes.',
            ],
          },
        ],
      },
      {
        id: 'graffiti-street-art',
        name: 'Graffiti & Poster Art',
        category: 'FINE ARTS',
        tagline: 'Bold typography, expressive spray & vibrant palettes',
        date: '[OFFICIAL DATE TO BE UPDATED]',
        time: '[TIMINGS TO BE ANNOUNCED]',
        venue: 'RVRJC OAT (Open Air Theatre Concourse)',
        teamSize: '2 - 3 Members',
        shortDescription:
          'Express bold messages and vibrant street art visuals on designated display boards.',
        registrationFee: 'FREE',
        registrationType: 'cultural',
        colorScheme: 'from-amber-500 to-red-500',
        rules: [
          {
            title: 'Guidelines',
            points: [
              'Artistic boards will be allocated.',
              'Vulgar, offensive, or defaming content is strictly disqualified.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'literary',
    name: 'LITERARY',
    subtitle: 'Debate, Slam Poetry & Eloquence',
    description:
      'Where words kindle thoughts. Powerful elocution, intellectual parliamentary debates, and poetic rhymes on stage.',
    iconName: 'BookOpen',
    hotspotPosition: [-1.5, 0.65, 1.7], // Small Stage Left
    cameraPosition: [0, 4.5, 9],
    hotspotLabel: 'Small Stage Left — Discourse & Slam Forum',
    events: [
      {
        id: 'slam-poetry',
        name: 'Slam Poetry & Spoken Word',
        category: 'LITERARY',
        tagline: 'Raw emotion, rhythmic cadence & spoken eloquence',
        date: '[OFFICIAL DATE TO BE UPDATED]',
        time: '[TIMINGS TO BE ANNOUNCED]',
        venue: 'RVRJC OAT (Open Air Theatre)',
        teamSize: 'Individual Solo',
        shortDescription:
          'Take the podium with your original poetry. Move hearts and minds with pure expressive cadence.',
        registrationFee: 'FREE',
        registrationType: 'cultural',
        colorScheme: 'from-emerald-600 to-teal-600',
        rules: [
          {
            title: 'Originality & Timing',
            points: [
              'Time limit: 3 to 4 minutes.',
              'Poem must be an original composition in English, Telugu, or Hindi.',
            ],
          },
        ],
      },
      {
        id: 'conventional-debate',
        name: 'The Great Debate',
        category: 'LITERARY',
        tagline: 'Clash of intellect, persuasive facts & rebuttal',
        date: '[OFFICIAL DATE TO BE UPDATED]',
        time: '[TIMINGS TO BE ANNOUNCED]',
        venue: 'RVRJC OAT (Open Air Theatre)',
        teamSize: '2 Members (1 For, 1 Against)',
        shortDescription:
          'Cross swords with words on trending tech, culture, and ethical questions of our generation.',
        registrationFee: 'FREE',
        registrationType: 'cultural',
        colorScheme: 'from-blue-600 to-indigo-600',
        rules: [
          {
            title: 'Rounds & Structure',
            points: [
              'Constructive speeches followed by interpellation / rebuttal.',
              'Maintain respectful decorum at all times.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'dramatics',
    name: 'DRAMATICS',
    subtitle: 'Street Play, Theatrics, Skit & Mono-Action',
    description:
      'Unleash drama, powerful monologues, impactful social street plays, and humorous skits in the open amphitheatre.',
    iconName: 'Drama',
    hotspotPosition: [0, 0.85, 0.2], // Center Pathway
    cameraPosition: [-3.5, 3.8, 7],
    hotspotLabel: 'Center Pathway — Thespian & Street Play Ring',
    events: [
      {
        id: 'nukkad-natak',
        name: 'Nukkad Natak (Street Play)',
        category: 'DRAMATIC',
        tagline: 'High volume, impactful social commentary & live chorus',
        date: '[OFFICIAL DATE TO BE UPDATED]',
        time: '[TIMINGS TO BE ANNOUNCED]',
        venue: 'RVRJC OAT (Open Air Theatre Circle)',
        teamSize: '8 - 20 Members',
        shortDescription:
          'Utilize live acoustic instruments (dholak, dafli, harmonium) and vocal choruses to highlight pressing societal themes.',
        registrationFee: 'FREE',
        registrationType: 'cultural',
        colorScheme: 'from-red-600 to-orange-600',
        rules: [
          {
            title: 'Performance & Space',
            points: [
              'Time limit: 10 to 12 minutes.',
              '360-degree performance circle around the OAT orchestra floor.',
            ],
          },
          {
            title: 'Live Elements',
            points: [
              'Only acoustic live instruments allowed. No recorded soundtrack or electronic mics.',
            ],
          },
        ],
      },
      {
        id: 'mono-acting',
        name: 'Mono Acting & Theatrical Solos',
        category: 'DRAMATIC',
        tagline: 'One performer, myriad emotions & intense gravitas',
        date: '[OFFICIAL DATE TO BE UPDATED]',
        time: '[TIMINGS TO BE ANNOUNCED]',
        venue: 'RVRJC OAT (Open Air Theatre)',
        teamSize: 'Individual Solo',
        shortDescription:
          'Deliver an unforgettable dramatic piece portraying character transitions and intense emotion.',
        registrationFee: 'FREE',
        registrationType: 'cultural',
        colorScheme: 'from-amber-600 to-rose-600',
        rules: [
          {
            title: 'Time & Props',
            points: [
              'Duration: 4 to 5 minutes.',
              'Minimal handheld props allowed.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'fashion',
    name: 'FASHION',
    subtitle: 'Runway, Couture, Theme & Stage Walk',
    description:
      'Glamour, poise, sustainable elegance, and ethnic grandeur walking down the central OAT runway ramp.',
    iconName: 'Sparkles',
    hotspotPosition: [-3.5, 1.45, -2.2], // Main Stage Left
    cameraPosition: [0, 3.2, 5.5],
    hotspotLabel: 'Main Stage Left — Haute Couture Ramp',
    events: [
      {
        id: 'panache-fashion-walk',
        name: 'Panache: The Runway Show',
        category: 'FASHION',
        tagline: 'Haute couture, cultural fusion & majestic stage presence',
        date: '[OFFICIAL DATE TO BE UPDATED]',
        time: '[TIMINGS TO BE ANNOUNCED]',
        venue: 'RVRJC OAT (Open Air Theatre)',
        teamSize: '8 - 14 Members',
        shortDescription:
          'Teams showcase thematic costume designs, synchronized runway walks, and creative presentation on the OAT stage.',
        registrationFee: 'FREE',
        registrationType: 'cultural',
        colorScheme: 'from-purple-600 to-pink-500',
        rules: [
          {
            title: 'Theme & Run Time',
            points: [
              'Runway duration: 8 to 10 minutes.',
              'Teams must adhere to defined themes (e.g., Cultural Heritage, Eco Futurism, Cyberpunk Fusion).',
            ],
          },
          {
            title: 'Decorum & Costumes',
            points: [
              'Designs must uphold dignified college standards.',
              'Audio tracks must be verified with the technical console during rehearsal slots.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'choreoday',
    name: 'CHOREODAY',
    subtitle: 'Mega-troupe Synchronized Collegiate Battles',
    description:
      'The crown jewel dance showdown of COLORIDO. Massive college troupes battle in synchrony, thematic storytelling, and dramatic stagecraft.',
    iconName: 'Users',
    hotspotPosition: [3.5, 1.45, -2.2], // Main Stage Right
    cameraPosition: [0, 4, 7.5],
    hotspotLabel: 'Main Stage Right — Choreoday Showcase',
    events: [
      {
        id: 'choreoday-grand-battle',
        name: 'Choreoday Grand Troupe Battle',
        category: 'CHOREODAY',
        tagline: 'Inter-collegiate mega choreography spectacle',
        date: '2026-10-17',
        time: '19:00 - 22:30',
        venue: 'RVRJC OAT (Open Air Theatre)',
        teamSize: '10 - 25 Members',
        shortDescription:
          'Grand scale thematic choreography combining classical, cinematic, and street styles.',
        registrationFee: 'FREE',
        registrationType: 'cultural',
        colorScheme: 'from-amber-500 to-orange-600',
        rules: [
          {
            title: 'Time & Crew Rules',
            points: [
              'Performance: 8 to 12 minutes.',
              'Props are allowed with 3-minute stage setup limit.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'tekraft',
    name: 'TEKRAFT EVENTS',
    subtitle: 'Creative Techno-Design, UI/UX & Digital Media',
    description:
      'Where technology meets artistic design. Live UI/UX design challenges, digital illustration, and multimedia creative hacks.',
    iconName: 'Cpu',
    hotspotPosition: [1.5, 0.65, 1.7], // Small Stage Right
    cameraPosition: [3.5, 3.5, 7],
    hotspotLabel: 'Small Stage Right — Tekraft Digital Arena',
    events: [
      {
        id: 'tekraft-ui-blitz',
        name: 'UI/UX Design Blitz',
        category: 'TEKRAFT EVENTS',
        tagline: 'Rapid prototyping, wireframing & aesthetic UI',
        date: '2026-10-16',
        time: '11:00 - 14:00',
        venue: 'Computer Center / OAT Digital Pavilion',
        teamSize: '1 - 2 Members',
        shortDescription:
          'Design an intuitive and striking mobile app interface based on a surprise festival prompt within 3 hours.',
        registrationFee: 'FREE',
        registrationType: 'cultural',
        colorScheme: 'from-cyan-500 to-blue-600',
        rules: [
          {
            title: 'Tools & Judging',
            points: [
              'Use Figma, Adobe XD, or Sketch.',
              'Evaluated on aesthetic harmony, usability, and typography.',
            ],
          },
        ],
      },
    ],
  },
];

/**
 * ============================================================================
 * SPORTS EVENTS — BOYS (Orange / Red) & GIRLS (Blue / Cyan)
 * ============================================================================
 * Boys:
 * 1. Volleyball (Playground in front of SJB Block)
 * 2. Basketball (Basketball Court inside campus)
 * 3. Table Tennis (Sports Plex in front of Canteen)
 *
 * Girls:
 * 1. Throwball (Playground in front of SJB Block)
 * 2. Tennikoit (Sports Plex in front of Canteen)
 * 3. Table Tennis (Sports Plex in front of Canteen)
 */
export const boysSportsEvents: SportsEvent[] = [
  {
    id: 'boys-volleyball',
    name: 'Volleyball',
    gender: 'boys',
    category: 'BOYS SPORTS',
    tagline: 'High spikes, rock-solid blocks & thunderous digs',
    date: '[OFFICIAL DATE TO BE UPDATED]',
    time: '[TIMINGS TO BE ANNOUNCED]',
    venue: 'Playground in front of SJB Block',
    venueId: 'sjb-playground',
    matchFormat: 'Knockout Tournament (Best of 3 Sets)',
    teamSize: '6 Playing + 4 Substitutes',
    shortDescription:
      'Unleash team coordination, aerial leaps, and high-velocity serves on the campus outdoor volleyball arena.',
    registrationFee: 'FREE',
    registrationType: 'boysSports',
    accentColor: 'from-amber-500 via-orange-600 to-red-600',
    image: '/assets/volleyball1.jpg',
    rules: [
      {
        title: 'Rules & Format',
        points: [
          'Matches will be conducted as per official Volleyball Federation of India (VFI) regulations.',
          'Preliminary rounds will be best of 3 sets of 25 points each (Deciding 3rd set 15 points if applicable).',
          'Standard net height of 2.43m will be maintained.',
        ],
      },
      {
        title: 'Equipment & Uniform',
        points: [
          'All team members must wear matching team jerseys with distinct numbers.',
          'Sports shoes are compulsory on court.',
        ],
      },
    ],
  },
  {
    id: 'boys-basketball',
    name: 'Basketball',
    gender: 'boys',
    category: 'BOYS SPORTS',
    tagline: 'Crossover dribbles, fast breaks & clutch three-pointers',
    date: '[OFFICIAL DATE TO BE UPDATED]',
    time: '[TIMINGS TO BE ANNOUNCED]',
    venue: 'Basketball Court inside campus',
    venueId: 'basketball-court',
    matchFormat: '4 Quarters (10 Minutes Each) • FIBA Rules',
    teamSize: '5 Playing + 5 Substitutes',
    shortDescription:
      'Fast-paced full-court action under the floodlights at the dedicated RVRJC synthetic/concrete court.',
    registrationFee: 'FREE',
    registrationType: 'boysSports',
    accentColor: 'from-orange-500 via-red-600 to-rose-700',
    image: '/assets/basketball1.jpg',
    rules: [
      {
        title: 'Tournament Format',
        points: [
          'Games will be conducted under FIBA rules.',
          '4 Quarters of 10 minutes running time (stopped clock during free throws & last 2 minutes).',
          'Individual foul limit: 5 personal fouls.',
        ],
      },
      {
        title: 'Reporting & Kit',
        points: [
          'Teams must report 20 minutes prior to scheduled tip-off.',
          'Non-marking basketball shoes are highly recommended.',
        ],
      },
    ],
  },
  {
    id: 'boys-table-tennis',
    name: 'Table Tennis',
    gender: 'boys',
    category: 'BOYS SPORTS',
    tagline: 'Lightning reflexes, heavy topspin & precise counter-loops',
    date: '[OFFICIAL DATE TO BE UPDATED]',
    time: '[TIMINGS TO BE ANNOUNCED]',
    venue: 'Sports Plex in front of Canteen',
    venueId: 'sportsplex',
    matchFormat: 'Singles & Team Knockout (Best of 5 Games)',
    teamSize: 'Singles / Team of 3',
    shortDescription:
      'Indoor competition featuring pristine tournament tables, balanced lighting, and fast-paced rallies in the Sports Plex.',
    registrationFee: 'FREE',
    registrationType: 'boysSports',
    accentColor: 'from-red-500 via-rose-600 to-amber-600',
    image: '/assets/sportsplex.jpg',
    rules: [
      {
        title: 'Match Rules',
        points: [
          'ITTF approved 40+ mm tournament balls will be used.',
          'Each game played to 11 points; deuce requires a 2-point lead.',
          'Service toss must be visibly upwards at least 16cm without spin.',
        ],
      },
      {
        title: 'Venue Protocol',
        points: [
          'Strictly indoor non-marking shoes inside the Sports Plex arena.',
          'Players must bring their own approved TT racquets (rubber must be intact).',
        ],
      },
    ],
  },
];

export const girlsSportsEvents: SportsEvent[] = [
  {
    id: 'girls-throwball',
    name: 'Throwball',
    gender: 'girls',
    category: 'GIRLS SPORTS',
    tagline: 'Swift aerial catches, tactical corners & powerful baseline throws',
    date: '[OFFICIAL DATE TO BE UPDATED]',
    time: '[TIMINGS TO BE ANNOUNCED]',
    venue: 'Playground in front of SJB Block',
    venueId: 'sjb-playground',
    matchFormat: 'Knockout Tournament (Best of 3 Sets)',
    teamSize: '7 Playing + 3 Substitutes',
    shortDescription:
      'High-speed agility and synchronized court coverage in the premier inter-college throwball tournament.',
    registrationFee: 'FREE',
    registrationType: 'girlsSports',
    accentColor: 'from-cyan-500 via-teal-600 to-blue-700',
    image: '/assets/volleyball1.jpg',
    rules: [
      {
        title: 'Game Guidelines',
        points: [
          'Played as per Throwball Federation of India guidelines.',
          'The ball must be caught with both hands and released with one hand above shoulder height.',
          'Maximum ball-holding time is 3 seconds.',
        ],
      },
      {
        title: 'Team Attire',
        points: [
          'All team members must wear matching sports jerseys.',
          'Proper athletic footwear mandatory on court.',
        ],
      },
    ],
  },
  {
    id: 'girls-tennikoit',
    name: 'Tennikoit',
    gender: 'girls',
    category: 'GIRLS SPORTS',
    tagline: 'Ring flight mastery, agile footwork & sharp net catches',
    date: '[OFFICIAL DATE TO BE UPDATED]',
    time: '[TIMINGS TO BE ANNOUNCED]',
    venue: 'Sports Plex in front of Canteen',
    venueId: 'sportsplex',
    matchFormat: 'Singles & Doubles Knockout (Best of 3 Sets to 21 Points)',
    teamSize: 'Singles / Doubles Pair',
    shortDescription:
      'Dynamic ring action testing precision, smooth catches, and deceptive spin deliveries.',
    registrationFee: 'FREE',
    registrationType: 'girlsSports',
    accentColor: 'from-sky-400 via-blue-600 to-indigo-700',
    image: '/assets/sportsplex.jpg',
    rules: [
      {
        title: 'Scoring & Rules',
        points: [
          'Played as per Tennikoit Federation of India rules.',
          'Ring must be delivered in an upward trajectory over the 1.8m net.',
          'No hand shifting or body touching allowed when catching the ring.',
        ],
      },
      {
        title: 'Court Guidelines',
        points: [
          'Indoor court in Sports Plex.',
          'Non-marking footwear required.',
        ],
      },
    ],
  },
  {
    id: 'girls-table-tennis',
    name: 'Table Tennis',
    gender: 'girls',
    category: 'GIRLS SPORTS',
    tagline: 'Spin mastery, rapid backhand blocks & calculated placements',
    date: '[OFFICIAL DATE TO BE UPDATED]',
    time: '[TIMINGS TO BE ANNOUNCED]',
    venue: 'Sports Plex in front of Canteen',
    venueId: 'sportsplex',
    matchFormat: 'Singles & Team Knockout (Best of 5 Games)',
    teamSize: 'Singles / Team of 3',
    shortDescription:
      'Indoor competition featuring pristine tournament tables, balanced lighting, and fast-paced rallies in the Sports Plex.',
    registrationFee: 'FREE',
    registrationType: 'girlsSports',
    accentColor: 'from-blue-500 via-indigo-600 to-cyan-600',
    image: '/assets/sportsplex.jpg',
    rules: [
      {
        title: 'Match Rules',
        points: [
          'ITTF approved 40+ mm tournament balls will be used.',
          'Each game played to 11 points; deuce requires a 2-point lead.',
          'Service toss must be visibly upwards at least 16cm without spin.',
        ],
      },
      {
        title: 'Venue Protocol',
        points: [
          'Strictly indoor non-marking shoes inside the Sports Plex arena.',
          'Players must bring their own approved TT racquets.',
        ],
      },
    ],
  },
];

/**
 * ============================================================================
 * CAMPUS VENUE CONFIGURATION
 * ============================================================================
 * Exactly mapped to real campus photos:
 * 1. RVRJC OAT (Open Air Theatre) -> oat1.jpeg, oat2.jpg, oat3.jpg, oat4.jpg, oat5.jpg
 * 2. Playground in front of SJB Block -> volleyball1.jpg
 * 3. Basketball Court inside campus -> basketball1.jpg, basketball2.webp
 * 4. Sports Plex in front of Canteen -> sportsplex.jpg
 */
export const campusVenues: Record<string, VenueInfo> = {
  'oat': {
    id: 'oat',
    name: 'RVRJC OAT (Open Air Theatre)',
    locationDetails: 'Central Cultural Core, RVR & JC Campus',
    description:
      'The iconic Open Air Theatre at RVR & JC College of Engineering features a massive semicircular stepped amphitheatre, overhead steel truss canopy, and elevated proscenium stage designed for premier artistic showcases.',
    images: [
      '/assets/oat1.jpeg',
      '/assets/oat2.jpg',
      '/assets/oat3.jpg',
      '/assets/oat4.jpg',
      '/assets/oat5.jpg',
    ],
    features: [
      'Seating capacity of 3,500+ spectators',
      'Acoustic overhead truss canopy and stage lighting rig',
      'Tiered amphitheatre steps offering panoramic audience sightlines',
      'Spacious backstage wings and green rooms',
    ],
    guidedViewAngles: [
      {
        label: 'Frontal Stage View',
        description: 'Main performance proscenium platform with canopy roof',
        imageIndex: 0,
        zoomLevel: 1.0,
      },
      {
        label: 'Amphitheatre Seating Arc',
        description: 'Semicircular tiers sweeping across the audience bowl',
        imageIndex: 1,
        zoomLevel: 1.1,
      },
      {
        label: 'Canopy & Truss Structure',
        description: 'Overhead acoustic steel canopy structure above the stage',
        imageIndex: 2,
        zoomLevel: 1.05,
      },
      {
        label: 'Left Wing & Audience Steps',
        description: 'Lateral staircase access and seating integration',
        imageIndex: 3,
        zoomLevel: 1.0,
      },
      {
        label: 'Panoramic Venue Perspective',
        description: 'Full venue panorama capturing scale and atmosphere',
        imageIndex: 4,
        zoomLevel: 1.0,
      },
    ],
  },
  'sjb-playground': {
    id: 'sjb-playground',
    name: 'Playground in front of SJB Block',
    locationDetails: 'North Campus Quadrangle, Front of SJB Academic Block',
    description:
      'Expansive open-air sports grounds bordered by academic blocks, dedicated to outdoor high-intensity team events like Volleyball and Throwball with natural turf and spectator perimeter.',
    images: [],
    features: [
      'Standard competition-sized court markings',
      'Clear perimeter with viewing galleries along SJB Block portico',
      'All-weather natural surface and professional net posts',
    ],
    guidedViewAngles: [
      {
        label: 'Court Baseline & Net Setup',
        description: 'Full court perspective facing the competition net',
        imageIndex: 0,
        zoomLevel: 1.0,
      },
      {
        label: 'Service Line & Attack Zone',
        description: 'Focused view on attack zone and frontline blocks',
        imageIndex: 0,
        zoomLevel: 1.25,
      },
      {
        label: 'SJB Block Perimeter Backdrop',
        description: 'Surrounding architectural view and spectator vantage point',
        imageIndex: 0,
        zoomLevel: 1.1,
      },
    ],
  },
  'basketball-court': {
    id: 'basketball-court',
    name: 'Basketball Court inside campus',
    locationDetails: 'Main Sports Complex, RVR & JC Campus',
    description:
      'Modern outdoor basketball facility equipped with high-grip court surface, professional glass backboards, perimeter fencing, and floodlights for evening games.',
    images: [],
    features: [
      'FIBA regulation court dimensions and boundary lines',
      'Heavy-duty sprung rims with shatterproof backboards',
      'Perimeter night floodlights and player benches',
    ],
    guidedViewAngles: [
      { label: 'Full Court Tip-off View', description: 'Wide view from sideline showing entire playing surface', imageIndex: 0, zoomLevel: 1.0 },
      { label: 'Hoop & Key Area Focus', description: 'Close-up of the backboard, rim, and restricted area key', imageIndex: 0, zoomLevel: 1.15 },
    ],
  },
  'sportsplex': {
    id: 'sportsplex',
    name: 'Sports Plex in front of Canteen',
    locationDetails: 'Student Activity Hub, Opposite College Central Canteen',
    description:
      'Spacious indoor multipurpose athletic pavilion hosting Table Tennis, Tennikoit, and indoor sporting tournaments. Protected from outdoor weather with optimal glare-free sports lighting.',
    images: [],
    features: [
      'Indoor tournament setup with anti-glare overhead lighting',
      'High-grade tournament Table Tennis tables and competition nets',
      'Direct walking convenience adjacent to the student canteen hub',
      'Non-marking sports flooring',
    ],
    guidedViewAngles: [
      { label: 'Sports Plex Main Arena', description: 'Front view of the indoor sports pavilion structure', imageIndex: 0, zoomLevel: 1.0 },
      { label: 'Arena Entrance & Concourse', description: 'Spectator and player entry gate opposite canteen', imageIndex: 0, zoomLevel: 1.2 },
    ],
  },
};
