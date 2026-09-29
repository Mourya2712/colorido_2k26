import { query } from './db';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function seed() {
  console.log('🌱 Seeding COLORIDO 2K26 database...\n');

  try {
    // ── Admin Account ──────────────────────────────────────────────
    const adminPasswordHash = await bcrypt.hash('colorido@2026', 12);
    await query(`
      INSERT INTO admins (email, password_hash, name, role)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
    `, ['admin@colorido2k26.com', adminPasswordHash, 'COLORIDO Organizer', 'super_admin']);
    console.log('✅ Admin account seeded  (admin@colorido2k26.com / colorido@2026)');

    // ── Event Categories ───────────────────────────────────────────
    const categories = [
      { name: 'Fine Arts', type: 'cultural', gender: 'all', icon: 'Palette', color: 'purple', order: 1, desc: 'Visual arts, painting, sketching, photography, and creative visual expressions.' },
      { name: 'Music & Band', type: 'cultural', gender: 'all', icon: 'Music', color: 'magenta', order: 2, desc: 'Solo and group musical performances across all genres and instruments.' },
      { name: 'Dance', type: 'cultural', gender: 'all', icon: 'PersonStanding', color: 'pink', order: 3, desc: 'Solo and group dance performances spanning classical, folk, western and fusion.' },
      { name: 'Choreoday', type: 'cultural', gender: 'all', icon: 'Star', color: 'gold', order: 4, desc: 'Theme-based choreography performance — a signature event of COLORIDO.' },
      { name: 'Dramatics', type: 'cultural', gender: 'all', icon: 'Theater', color: 'orange', order: 5, desc: 'Theatrical drama, skit, mime, and mono-acting performances.' },
      { name: 'Fashion Show', type: 'cultural', gender: 'all', icon: 'Crown', color: 'amber', order: 6, desc: 'Creative fashion and costume design showcased on stage.' },
      { name: 'Tekraft Events', type: 'cultural', gender: 'all', icon: 'Cpu', color: 'cyan', order: 7, desc: 'Tech meets creativity — events combining technology with artistic talent.' },
      { name: 'Literary', type: 'cultural', gender: 'all', icon: 'BookOpen', color: 'indigo', order: 8, desc: 'Creative writing, debate, quiz, JAM, and other literary competitions.' },
      { name: 'Boys Sports', type: 'sports', gender: 'boys', icon: 'Trophy', color: 'orange', order: 9, desc: 'Competitive sports events for boys athletes.' },
      { name: 'Girls Sports', type: 'sports', gender: 'girls', icon: 'Trophy', color: 'cyan', order: 10, desc: 'Competitive sports events for girls athletes.' },
    ];

    const categoryIds: Record<string, string> = {};
    for (const cat of categories) {
      const result = await query(`
        INSERT INTO event_categories (name, type, gender, description, icon_name, color_scheme, display_order)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT DO NOTHING RETURNING id
      `, [cat.name, cat.type, cat.gender, cat.desc, cat.icon, cat.color, cat.order]);
      
      if (result.rows.length > 0) {
        categoryIds[cat.name] = result.rows[0].id;
      } else {
        const existing = await query('SELECT id FROM event_categories WHERE name = $1', [cat.name]);
        if (existing.rows.length > 0) categoryIds[cat.name] = existing.rows[0].id;
      }
    }
    console.log('✅ Event categories seeded (8 Cultural + 2 Sports)');

    // ── Cultural Events ────────────────────────────────────────────
    const culturalEvents = [
      // Fine Arts
      {
        category: 'Fine Arts', name: 'Pencil Sketching', slug: 'fine-arts-pencil-sketching',
        type: 'cultural', gender: 'all', subcategory: 'Fine Arts',
        tagline: 'Let Your Lines Tell a Story',
        short_desc: 'Showcase your pencil sketching talent with a theme revealed on the day of the event.',
        desc: 'Participants will be given a theme on the spot and must complete a pencil sketch within the allotted time. Judged on creativity, technique, and expression.',
        rules: '[OFFICIAL RULES TO BE UPDATED]',
        venue: 'RVRJC OAT', venue_id: 'oat',
        reg_type: 'individual', min_size: 1, max_size: 1,
      },
      {
        category: 'Fine Arts', name: 'Poster Making', slug: 'fine-arts-poster-making',
        type: 'cultural', gender: 'all', subcategory: 'Fine Arts',
        tagline: 'Design That Speaks',
        short_desc: 'Create an impactful poster on a given theme using your creative design skills.',
        desc: 'Participants create posters on themes provided at the venue. Judged on visual impact, message clarity, and artistic quality.',
        rules: '[OFFICIAL RULES TO BE UPDATED]',
        venue: 'RVRJC OAT', venue_id: 'oat',
        reg_type: 'individual', min_size: 1, max_size: 1,
      },
      // Music & Band
      {
        category: 'Music & Band', name: 'Solo Singing', slug: 'music-solo-singing',
        type: 'cultural', gender: 'all', subcategory: 'Solo',
        tagline: 'One Voice, Infinite Expression',
        short_desc: 'Solo vocal performance — any genre, any language.',
        desc: 'Individual vocal performance open to all genres and languages. Judged on pitch, rhythm, expression, and stage presence.',
        rules: '[OFFICIAL RULES TO BE UPDATED]',
        venue: 'RVRJC OAT', venue_id: 'oat',
        reg_type: 'individual', min_size: 1, max_size: 1,
      },
      {
        category: 'Music & Band', name: 'Band Performance', slug: 'music-band-performance',
        type: 'cultural', gender: 'all', subcategory: 'Group',
        tagline: 'Sound as One',
        short_desc: 'Group musical band performance — rock, fusion, classical, or any genre.',
        desc: 'Full band performance for groups. Vocal and instrumental. All genres welcome. Judged on coordination, musicianship, and overall performance.',
        rules: '[OFFICIAL RULES TO BE UPDATED]',
        venue: 'RVRJC OAT', venue_id: 'oat',
        reg_type: 'team', min_size: 3, max_size: 10,
      },
      // Dance
      {
        category: 'Dance', name: 'Solo Dance', slug: 'dance-solo',
        type: 'cultural', gender: 'all', subcategory: 'Solo',
        tagline: 'Move Like No One\'s Watching',
        short_desc: 'Solo dance performance — any form, any style.',
        desc: 'Individual dance performance open to all dance forms including classical, western, freestyle, folk, and fusion.',
        rules: '[OFFICIAL RULES TO BE UPDATED]',
        venue: 'RVRJC OAT', venue_id: 'oat',
        reg_type: 'individual', min_size: 1, max_size: 1,
      },
      {
        category: 'Dance', name: 'Group Dance', slug: 'dance-group',
        type: 'cultural', gender: 'all', subcategory: 'Group',
        tagline: 'Synchronized Souls',
        short_desc: 'Group dance performance — any genre, any formation.',
        desc: 'Group dance performance for teams. All styles welcome. Judged on synchronization, energy, costume, and choreography.',
        rules: '[OFFICIAL RULES TO BE UPDATED]',
        venue: 'RVRJC OAT', venue_id: 'oat',
        reg_type: 'team', min_size: 4, max_size: 15,
      },
      // Choreoday
      {
        category: 'Choreoday', name: 'Choreoday', slug: 'choreoday-theme',
        type: 'cultural', gender: 'all', subcategory: 'Theme Based',
        tagline: 'Where Story Meets Rhythm',
        short_desc: 'A signature COLORIDO event — theme-based group choreography.',
        desc: 'COLORIDO\'s flagship event — Choreoday is a high-energy theme-based group choreography competition. Teams perform a narrative dance sequence around a given theme combining drama, music, and dance.',
        rules: '[OFFICIAL RULES TO BE UPDATED]',
        venue: 'RVRJC OAT', venue_id: 'oat',
        reg_type: 'team', min_size: 6, max_size: 20,
      },
      // Dramatics
      {
        category: 'Dramatics', name: 'Drama', slug: 'dramatics-drama',
        type: 'cultural', gender: 'all', subcategory: 'Dramatics',
        tagline: 'The Stage is Yours',
        short_desc: 'Full theatrical drama performance — any theme or genre.',
        desc: 'Full theatrical performance open to any theme, language, or genre. Judged on script, acting, direction, staging, and audience impact.',
        rules: '[OFFICIAL RULES TO BE UPDATED]',
        venue: 'RVRJC OAT', venue_id: 'oat',
        reg_type: 'team', min_size: 3, max_size: 12,
      },
      {
        category: 'Dramatics', name: 'Skit', slug: 'dramatics-skit',
        type: 'cultural', gender: 'all', subcategory: 'Dramatics',
        tagline: 'Short, Sharp, Spectacular',
        short_desc: 'Short comedy or dramatic skit performance.',
        desc: 'Short-form theatrical skit with a time limit. Judged on creativity, humor, message, and performance quality.',
        rules: '[OFFICIAL RULES TO BE UPDATED]',
        venue: 'RVRJC OAT', venue_id: 'oat',
        reg_type: 'team', min_size: 2, max_size: 6,
      },
      // Fashion Show
      {
        category: 'Fashion Show', name: 'Fashion Show', slug: 'fashion-show',
        type: 'cultural', gender: 'all', subcategory: 'Fashion Show',
        tagline: 'Walk. Stun. Conquer.',
        short_desc: 'Creative fashion and costume presentation on the RVRJC OAT stage.',
        desc: 'A spectacular fashion show event where teams present creative costumes, styling, and choreographed ramp walks. Theme announced before the event.',
        rules: '[OFFICIAL RULES TO BE UPDATED]',
        venue: 'RVRJC OAT', venue_id: 'oat',
        reg_type: 'team', min_size: 5, max_size: 15,
      },
      // Tekraft
      {
        category: 'Tekraft Events', name: 'Tekraft Events', slug: 'tekraft-events',
        type: 'cultural', gender: 'all', subcategory: 'Tekraft',
        tagline: 'Tech Meets Creativity',
        short_desc: 'Technology-based creative events — specific sub-events to be announced.',
        desc: 'Tekraft combines technology with creativity. Sub-events will be announced by the organizing committee. Stay tuned for the complete list of Tekraft competitions.',
        rules: '[OFFICIAL RULES TO BE UPDATED]',
        venue: 'RVRJC OAT', venue_id: 'oat',
        reg_type: 'both', min_size: 1, max_size: 4,
      },
      // Literary
      {
        category: 'Literary', name: 'JAM Session', slug: 'literary-jam',
        type: 'cultural', gender: 'all', subcategory: 'Literary',
        tagline: 'Just A Minute of Brilliance',
        short_desc: 'Just A Minute — speak on a topic for 60 seconds without hesitation, repetition, or deviation.',
        desc: 'Classic JAM competition. Participants must speak on a given topic for one minute without hesitation, repetition, or deviation from the topic.',
        rules: '[OFFICIAL RULES TO BE UPDATED]',
        venue: 'RVRJC OAT', venue_id: 'oat',
        reg_type: 'individual', min_size: 1, max_size: 1,
      },
      {
        category: 'Literary', name: 'Debate', slug: 'literary-debate',
        type: 'cultural', gender: 'all', subcategory: 'Literary',
        tagline: 'Words as Weapons',
        short_desc: 'Inter-college debate competition on current and relevant topics.',
        desc: 'Parliamentary or extempore debate competition. Topics related to current affairs, college life, and social issues.',
        rules: '[OFFICIAL RULES TO BE UPDATED]',
        venue: 'RVRJC OAT', venue_id: 'oat',
        reg_type: 'team', min_size: 2, max_size: 2,
      },
      {
        category: 'Literary', name: 'Quiz', slug: 'literary-quiz',
        type: 'cultural', gender: 'all', subcategory: 'Literary',
        tagline: 'Battle of Minds',
        short_desc: 'General knowledge and technical quiz competition.',
        desc: 'Multi-round quiz competition covering general knowledge, current affairs, science, technology, and campus topics.',
        rules: '[OFFICIAL RULES TO BE UPDATED]',
        venue: 'RVRJC OAT', venue_id: 'oat',
        reg_type: 'team', min_size: 2, max_size: 3,
      },
    ];

    for (const ev of culturalEvents) {
      const catId = categoryIds[ev.category];
      await query(`
        INSERT INTO events (category_id, name, slug, type, gender, subcategory, tagline, short_description,
          description, rules, venue, venue_id, registration_type, min_team_size, max_team_size, registration_fee)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        ON CONFLICT (slug) DO NOTHING
      `, [catId, ev.name, ev.slug, ev.type, ev.gender, ev.subcategory, ev.tagline,
          ev.short_desc, ev.desc, ev.rules, ev.venue, ev.venue_id, ev.reg_type,
          ev.min_size, ev.max_size, 0]);
    }
    console.log(`✅ Cultural events seeded (${culturalEvents.length} events)`);

    // ── Sports Events ──────────────────────────────────────────────
    const sportsEvents = [
      // Boys Sports
      {
        category: 'Boys Sports', name: 'Basketball', slug: 'sports-boys-basketball',
        type: 'sports', gender: 'boys', subcategory: 'Team Sport',
        tagline: 'Hoop Dreams, Campus Glory',
        short_desc: 'Inter-college basketball tournament for boys.',
        desc: 'Fast-paced competitive basketball tournament. Standard court rules apply. Teams compete in knockout rounds.',
        rules: '[OFFICIAL RULES TO BE UPDATED]',
        venue: 'Basketball Court, Inside Campus', venue_id: 'basketball',
        reg_type: 'team', min_size: 5, max_size: 10,
      },
      {
        category: 'Boys Sports', name: 'Volleyball', slug: 'sports-boys-volleyball',
        type: 'sports', gender: 'boys', subcategory: 'Team Sport',
        tagline: 'Spike It to the Top',
        short_desc: 'Inter-college volleyball tournament for boys.',
        desc: 'Competitive volleyball tournament with standard FIVB rules. Teams compete in group and knockout stages.',
        rules: '[OFFICIAL RULES TO BE UPDATED]',
        venue: 'Playground in front of SJB Block', venue_id: 'volleyball',
        reg_type: 'team', min_size: 6, max_size: 10,
      },
      {
        category: 'Boys Sports', name: 'Table Tennis (Boys)', slug: 'sports-boys-table-tennis',
        type: 'sports', gender: 'boys', subcategory: 'Racket Sport',
        tagline: 'Precision. Speed. Control.',
        short_desc: 'Table tennis singles/doubles tournament for boys.',
        desc: 'Competitive table tennis tournament. Best of 3 sets format in knockout rounds. Standard TT rules apply.',
        rules: '[OFFICIAL RULES TO BE UPDATED]',
        venue: 'Sports Plex in front of Canteen', venue_id: 'sportsplex',
        reg_type: 'individual', min_size: 1, max_size: 2,
      },
      // Girls Sports
      {
        category: 'Girls Sports', name: 'Throwball', slug: 'sports-girls-throwball',
        type: 'sports', gender: 'girls', subcategory: 'Team Sport',
        tagline: 'Throw It to Win It',
        short_desc: 'Inter-college throwball tournament for girls.',
        desc: 'Competitive throwball tournament with standard rules. Teams compete on the SJB Block playground.',
        rules: '[OFFICIAL RULES TO BE UPDATED]',
        venue: 'Playground in front of SJB Block', venue_id: 'volleyball',
        reg_type: 'team', min_size: 7, max_size: 9,
      },
      {
        category: 'Girls Sports', name: 'Tennikoit', slug: 'sports-girls-tennikoit',
        type: 'sports', gender: 'girls', subcategory: 'Racket Sport',
        tagline: 'Ring It Right',
        short_desc: 'Tennikoit competition for girls — ring-based racket sport.',
        desc: 'Tennikoit is a ring-based racket sport. Competitive tournament with knockout rounds at the Sports Plex.',
        rules: '[OFFICIAL RULES TO BE UPDATED]',
        venue: 'Sports Plex in front of Canteen', venue_id: 'sportsplex',
        reg_type: 'individual', min_size: 1, max_size: 2,
      },
      {
        category: 'Girls Sports', name: 'Table Tennis (Girls)', slug: 'sports-girls-table-tennis',
        type: 'sports', gender: 'girls', subcategory: 'Racket Sport',
        tagline: 'Swift. Skilled. Unstoppable.',
        short_desc: 'Table tennis singles/doubles tournament for girls.',
        desc: 'Competitive table tennis tournament for girls. Best of 3 sets knockout format. Standard rules apply.',
        rules: '[OFFICIAL RULES TO BE UPDATED]',
        venue: 'Sports Plex in front of Canteen', venue_id: 'sportsplex',
        reg_type: 'individual', min_size: 1, max_size: 2,
      },
    ];

    for (const ev of sportsEvents) {
      const catId = categoryIds[ev.category];
      await query(`
        INSERT INTO events (category_id, name, slug, type, gender, subcategory, tagline, short_description,
          description, rules, venue, venue_id, registration_type, min_team_size, max_team_size, registration_fee)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        ON CONFLICT (slug) DO NOTHING
      `, [catId, ev.name, ev.slug, ev.type, ev.gender, ev.subcategory, ev.tagline,
          ev.short_desc, ev.desc, ev.rules, ev.venue, ev.venue_id, ev.reg_type,
          ev.min_size, ev.max_size, 0]);
    }
    console.log(`✅ Sports events seeded (${sportsEvents.length} events)`);

    // ── Announcements ──────────────────────────────────────────────
    const announcements = [
      {
        title: 'COLORIDO 2K26 Registration Now Open!',
        content: 'Registrations for COLORIDO 2K26 — the annual cultural and sports festival of RVR & JC College of Engineering — are now open. All events are FREE to register. Visit the events page to explore and register.',
        category: 'registration', priority: 'high', is_published: true, is_ticker: true,
      },
      {
        title: 'NO REGISTRATION FEE for All Events',
        content: 'COLORIDO 2K26 is proud to announce that participation in ALL cultural and sports events is completely FREE. No registration fee for any event. Register now!',
        category: 'general', priority: 'urgent', is_published: true, is_ticker: true,
      },
      {
        title: 'Cultural Events Schedule — Coming Soon',
        content: 'The official schedule for all cultural events will be announced shortly. Stay tuned for the complete COLORIDO 2K26 schedule.',
        category: 'cultural', priority: 'normal', is_published: true, is_ticker: false,
      },
      {
        title: 'Sports Events — Register Your Teams',
        content: 'Sports team registrations are open! Register your team for Basketball, Volleyball, Table Tennis, Throwball, and Tennikoit. Limited slots available.',
        category: 'sports', priority: 'high', is_published: true, is_ticker: false,
      },
      {
        title: 'Official Event Dates — [OFFICIAL DATE TO BE UPDATED]',
        content: 'The official dates for COLORIDO 2K26 will be announced soon by the organizing committee. This announcement will be updated with confirmed dates.',
        category: 'general', priority: 'high', is_published: true, is_ticker: true,
      },
    ];

    for (const ann of announcements) {
      await query(`
        INSERT INTO announcements (title, content, category, priority, is_published, is_ticker, published_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT DO NOTHING
      `, [ann.title, ann.content, ann.category, ann.priority, ann.is_published, ann.is_ticker, ann.is_published ? new Date() : null]);
    }
    console.log(`✅ Announcements seeded (${announcements.length})`);

    // ── Schedule Items ─────────────────────────────────────────────
    await query(`
      INSERT INTO schedule_items (title, description, event_type, venue, schedule_date, start_time, end_time, display_order)
      VALUES 
        ('COLORIDO 2K26 — Inauguration Ceremony', 'Grand opening ceremony of COLORIDO 2K26 with lamp lighting and cultural performances.', 'ceremony', 'RVRJC OAT', '2026-10-15', '09:00', '11:00', 1),
        ('Cultural Events — Day 1', '[OFFICIAL SCHEDULE TO BE UPDATED]', 'cultural', 'RVRJC OAT', '2026-10-15', '11:00', '18:00', 2),
        ('Sports Events — Day 1', '[OFFICIAL SCHEDULE TO BE UPDATED]', 'sports', 'Campus Sports Grounds', '2026-10-15', '09:00', '17:00', 3),
        ('Cultural Events — Day 2', '[OFFICIAL SCHEDULE TO BE UPDATED]', 'cultural', 'RVRJC OAT', '2026-10-16', '10:00', '18:00', 4),
        ('Sports Finals', '[OFFICIAL SCHEDULE TO BE UPDATED]', 'sports', 'Campus Sports Grounds', '2026-10-16', '09:00', '16:00', 5),
        ('Valedictory & Prize Distribution', 'Grand closing ceremony with prize distribution and cultural performances.', 'ceremony', 'RVRJC OAT', '2026-10-16', '18:00', '21:00', 6)
      ON CONFLICT DO NOTHING
    `);
    console.log('✅ Schedule items seeded');

    // ── Sponsors (placeholders) ────────────────────────────────────
    await query(`
      INSERT INTO sponsors (name, logo_url, category, description, display_order)
      VALUES 
        ('[TITLE SPONSOR TO BE ADDED]', null, 'title', 'Title sponsorship slot available', 1),
        ('[PLATINUM SPONSOR TO BE ADDED]', null, 'platinum', 'Platinum sponsorship slot available', 2),
        ('[GOLD SPONSOR TO BE ADDED]', null, 'gold', 'Gold sponsorship slot available', 3),
        ('[MEDIA PARTNER TO BE ADDED]', null, 'media', 'Media partner slot available', 4)
      ON CONFLICT DO NOTHING
    `);
    console.log('✅ Sponsor placeholders seeded');

    // ── Site Configuration ─────────────────────────────────────────
    const configs = [
      ['college_name', 'RVR & JC College of Engineering', 'College name'],
      ['festival_name', 'COLORIDO 2K26', 'Festival name'],
      ['festival_tagline', 'Your Stage. Your Game. Your COLORIDO.', 'Festival tagline'],
      ['festival_dates', '[OFFICIAL DATE TO BE UPDATED]', 'Festival dates'],
      ['college_address', 'Chandramoulipuram, Chowdavaram, Guntur, Andhra Pradesh 522019', 'College address'],
      ['contact_email', '[OFFICIAL EMAIL TO BE ADDED]', 'Contact email'],
      ['contact_phone', '[OFFICIAL PHONE TO BE ADDED]', 'Contact phone'],
      ['instagram_url', '[INSTAGRAM URL TO BE ADDED]', 'Instagram'],
      ['youtube_url', '[YOUTUBE URL TO BE ADDED]', 'YouTube'],
      ['facebook_url', '[FACEBOOK URL TO BE ADDED]', 'Facebook'],
      ['about_text', 'A celebration of creativity, talent, competition, and campus spirit at RVR & JC College of Engineering.', 'About text'],
      ['registration_fee_notice', 'NO REGISTRATION FEE — All events are completely free to participate.', 'Fee notice'],
    ];
    for (const [key, value, description] of configs) {
      await query(`
        INSERT INTO site_config (key, value, description)
        VALUES ($1, $2, $3)
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
      `, [key, value, description]);
    }
    console.log('✅ Site configuration seeded');

    // ── Gallery (placeholder entries) ─────────────────────────────
    const galleryEntries = [
      { title: 'RVRJC OAT Main Stage', caption: 'The iconic Open Air Theatre of RVR & JC College of Engineering', image_url: '/assets/oat1.jpeg', category: 'campus' },
      { title: 'RVRJC OAT Seating', caption: 'OAT seating area — setting for COLORIDO 2K26 cultural events', image_url: '/assets/oat2.jpg', category: 'campus' },
      { title: 'Basketball Court', caption: 'RVRJC Basketball Court inside campus', image_url: '/assets/basketball1.jpg', category: 'sports' },
      { title: 'Volleyball Playground', caption: 'Playground in front of SJB Block', image_url: '/assets/volleyball1.jpg', category: 'sports' },
    ];
    for (const g of galleryEntries) {
      await query(`
        INSERT INTO gallery (title, caption, image_url, category, is_published)
        VALUES ($1, $2, $3, $4, true)
        ON CONFLICT DO NOTHING
      `, [g.title, g.caption, g.image_url, g.category]);
    }
    console.log('✅ Gallery entries seeded');

    console.log('\n🎉 Database seeding complete!\n');
    console.log('📋 Admin credentials:');
    console.log('   Email: admin@colorido2k26.com');
    console.log('   Password: colorido@2026\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
